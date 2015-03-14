if (/goodreads\.com$/.test(document.domain)) {
  var on_page = makeBox();

  if (on_page===true){

    var page_info = pageInfo(),
      search_urls = searchURLs(page_info['author'], page_info['title'],page_info['isbn']);

    if (page_info['isbn']===null){
      searchSirsi(search_urls['bookURL'], "text", $("div#book"), "Book");
    } else {
      searchSirsi(search_urls['isbnURL'],"isbn",$("div#book"), "Book");
    }
    searchSirsi(search_urls['ebookURL'], "text", $("div#digital"), "E-book");   
  }
}

function makeBox() {
  var container;

  if ($('div.rightContainer').length) {
    container = $('div.rightContainer:first');
    container.prepend(
      "<div id='dcpl_goodreads'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
      chrome.extension.getURL('assets/ajax-loader.gif') +
      "'> </div>  <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
      chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
      return true;
  } else {
    console.log("Could not create box")
      return false;
  }
}


function pageInfo() {

  var success, page_type, title, isbn, isbn13, author;

    isbn13 = $("div .infoBoxRowItem:contains('ISBN13')").text();
    isbn = isbn13.split(':')[1].replace(/\D/g,'');
    title = $("#bookTitle").text().replace(/^\n */,'');
    author = $(".authorName:eq(0)").text();
    console.log(isbn);
    console.log(title);
    console.log(author);
    
    return { "success": success, "page_type": page_type, "author": cleanAuthor(author), "title": cleanTitle(title), "isbn": isbn };
}

function cleanTitle(title) {
  console.log("Title cleaned");
  return title.replace(/\(.*\)/g, "").replace(/\[.*\]/, "");
}

function cleanAuthor(author) {
  console.log("Author cleaned");
  return author.replace("Ph.D.", "").replace(/ +$/, "");
}

function searchURLs(author, title, isbn) {
  console.log("URLs established");
  var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
  return {
    "isbnURL": base + isbn + "&te=&lm=BOOKS",
    "bookURL": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&te=&lm=BOOKS",
    "ebookURL": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&qf=-ERC_FORMAT%09Electronic+Format%09MP3%09MP3&te=&lm=E-BOOK",
    "purchaseURL": "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X",
    "overdriveURL" : "http://overdrive.dclibrary.org"
  }
}

function searchSirsi(search_url, search_by, modify, type) {
  $.get(search_url, function(data) {
    oneline = $(data).text().replace(/\n/g, "");
    if (type=="Book") {
      console.log("Searching catalog for book");
      sirsiAvailability(oneline, search_url, search_by, modify, type);
    } else {
      console.log("Searching catalog for ebook");
      searchOverdrive(oneline,search_url, "http://overdrive.dclibrary.org", modify, type);
    }
  });
}

function searchOverdrive(oneline, url, fail_url, modify, type) {

  var overdrive_id, overdrive_url, overdrive_oneline;

  if (oneline.match(/\{[A-Z0-9\-]+\}/)){
    overdrive_id = oneline.replace(/.*{([A-Z0-9\-]+?)}.*/, "$1");
  } else if (oneline.match(/fOVERDRIVE\:(.+?)\$/)) {
    overdrive_id = oneline.replace(/(.+?)fOVERDRIVE\:(.+?)\/0\/0.*/, "$2");
  } else {
    overdrive_id = "";
    console.log("Ebook not located in Sirsi");
    failureMessage(type,"not_located",search_urls['overdriveURL'],modify);    
  }

  if (overdrive_id.length > 1 && overdrive_id.length < 100) {
    console.log("Ebook found in Sirsi");
    overdrive_url = "http://overdrive.dclibrary.org/ContentDetails.htm?id=" + overdrive_id;
    $.get(overdrive_url,function(data){
      console.log("Searching ebook availability in Overdrive");
      overdrive_oneline = $(data).text().replace(/\n/g,"");
      overdriveAvailability(overdrive_oneline, overdrive_url, modify, type);
    });
  }    
  }

function sirsiAvailability(oneline, url, search_by, modify, type) {

  try {

      var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/, "$1"));
        available = availabilityJSON['totalAvailable'].toString(),
        total = availabilityJSON['copies'][0].match(/(\d+)$/)[1],
        wait = availabilityJSON['holdCounts'][0].match(/(\d+)$/)[1];

      console.log("Book located in Sirsi");
      successMessage(total, available, wait, type, modify, url);

  } catch (e) {

    if (search_by==="isbn") {
      console.log("Sirsi book search by ISBN failed\nSearching instead by title and author");
      searchSirsi(search_urls['bookURL'], "text", modify, type);
    } else if (oneline.match("This search returned no results.")!=null){
      console.log("Book not located in Sirsi");
      failureMessage(type,"not_located",url,modify);
    } else {
      console.log("Uncertain book match in Sirsi");
      failureMessage(type,"uncertain",url,modify);
      } 

  }

}

function overdriveAvailability(oneline, url, modify, type) {

  var availability = oneline.replace(/.*Copies-Available:(\d+)Library copies:(\d+)var deNumWaiting = (\d+?)\;.*/,"$1,$2,$3"),
      available = availability.split(',')[0],
      total = availability.split(',')[1],
      wait = availability.split(',')[2];

    successMessage(total, available, wait, type, modify, url);

}

function successMessage(total, available, wait, type, modify, result_url) {

  if (total.match(/^1$/) !== null) {
    var total_statement = total + " copy";
  } else if (total.match(/^[0-9]+$/) !== null) {
    var total_statement = total + " copies";
  }

  if (wait.match(/^1$/) !== null) {
    var wait_statement = wait + " patron waiting"
  } else if (wait.match(/^[0-9]+$/) !== null) {
    var wait_statement = wait + " patrons waiting"
  }

  if (wait.match(/^[0-9]+$/) !== null && wait.match(/^0$/) === null && available.match(
    /^0$/) !== null && total.match(/^[0-9]+$/) !== null) {
    modify.html("<a id='results' href = '" + result_url + "'>" + type + " located </a> <br>" + total_statement + " (" + wait_statement + ")");
  } else {
    modify.html("<a id='results' href = '" + result_url + "'>" + type + " located </a> <br>" + total_statement + " (" + available + " available)");
  }

}

function failureMessage(type,failure,failure_url,modify){
  if (type==="Book"){
    var purchase_message =  "<br> <a id='results' href = '" + search_urls['purchaseURL'] + "'>Request purchase</a>",
      ebook_message = "";
  } else {
    var purchase_message = "",
      ebook_message =  "<br> <a id='results' href = '" + search_urls['overdriveURL'] + "'>Search manually</a>";
  }



  if (failure==="not_located") {
          modify.html(type + " not located <br> <a id='results' href = '" + failure_url + "'>Search manually</a>" + purchase_message);                
  } else {
          modify.html("Possible match located <br> <a id='results' href = '" + failure_url + "'>View results</a>" + ebook_message + purchase_message);
  }

}
