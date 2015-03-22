function cleanTitle(title) {
  console.log("Initialize: Title cleaned");
  return title.replace(/\(.*\)/g, "").replace(/\[.*\]/, "").replace(/^\s*(.*?)\s*$/,"$1");
}

function overdriveTitle(title) {
  return title.replace(/:.*/,"");
}

function cleanAuthor(author) {
  console.log("Initialize: Author cleaned");
  return author.replace("Ph.D.", "").replace(/ +$/, "");
}

function overdriveAuthor(author) {
  return author.replace(/([A-Z]\.)+/g,"");
}

function convertISBN(isbn10) {
  console.log("Initialize: Converting ISBN-10 to ISBN-13");
  var isbn = "978"+isbn10.substring(0, isbn10.length - 1);;
  isbn = isbn + checkDigit(isbn);
  return isbn;
}

function checkDigit(isbn) {
  var sum = 0
  for (var i = 1; i < isbn.length+1; i++) { 
    if (i%2===0) {
      sum += parseInt(isbn.charAt(i-1))*3;
    } else {
      sum += parseInt(isbn.charAt(i-1));
    }
  }
  var check = (10 - sum%10)%10;
  return check.toString();
}

function searchURLs(author, title, isbn) {
  console.log("Initialize: Establishing URLs");
  var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
  return {
    "isbnURL": base + isbn + "&te=&lm=BOOKS",
    "bookURL": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&qu=-%22sound+recording%22&te=&lm=BOOKS",
    "altBookURL": base + encodeURIComponent(overdriveTitle(title) + " " + author).replace(/'/g, "%27") + "&te=&lm=BOOKS",
    "overdriveSearchURL" : "http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria="+encodeURIComponent(overdriveTitle(title) + " " + overdriveAuthor(author))+"&x=0&y=0&Format=420%2C50%2C410%2C450%2C610%2C810%2C303",
    "purchaseURL": "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X",
    "overdriveURL" : "http://overdrive.dclibrary.org"
  }
}

function searchSirsi(search_url, search_by, modify, type, info) {
  $.get(search_url, function(data) {
    oneline = $(data).text().replace(/\n/g, "");
    if (type=="Book") {
      sirsiAvailability(oneline, search_url, search_by, modify, type, info);
    } 
  });
}

function searchOverdrive(search_url, fail_url, search_by, modify, type, info) {
  console.log("E-book: Searching Overdrive");
  chrome.runtime.sendMessage({
    method: 'GET',
    action: 'xhttp',
    url: search_url    }, 
    function(response){

      var result = $(response);
      overdriveAvailability(result, fail_url, modify, type, info);
  });

}

function sirsiAvailability(oneline, url, search_by, modify, type, info) {

  try {

      var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/, "$1"));
        available = availabilityJSON['totalAvailable'].toString(),
        total = availabilityJSON['copies'][0].match(/(\d+)$/)[1],
        wait = availabilityJSON['holdCounts'][0].match(/(\d+)$/)[1];

      successMessage(total, available, wait, type, modify, url);
      console.log("Book: Located in catalog");

  } catch (e) {

    if (search_by==="isbn") {
      console.log("Book: Search by ISBN failed\nBook: Searching catalog by title and author");
      searchSirsi(search_urls['bookURL'], "text_full", modify, type, info);
    } else if (search_by==="text_full" && info['title'].match(/:/) !== null){
      console.log("Book: Searching catalog without subtitle");
      searchSirsi(search_urls['altBookURL'], "text_short", modify, type, info);
    } else if (oneline.match("This search returned no results.")!=null){
      console.log("Book: Not located in catalog");
      failureMessage(type,"not_located",url,modify);
    } else {
      console.log("Book: Uncertain match in catalog");
      failureMessage(type,"uncertain",url,modify);
      } 

  }

}

function overdriveAvailability(result, url, modify, type, info) {

 try {

        var availabilityInfo = result.find('.img-and-info-contain:eq(0)'),
            available = availabilityInfo.attr( "data-copiesavail" ),
            total = availabilityInfo.attr( "data-copiestotal" ),
            wait = availabilityInfo.attr( "data-numwaiting" );

        var view = result.find('.li-details a:eq(0)'),
            link = "http://overdrive.dclibrary.org/10/50/en/"+view.attr("href");

      successMessage(total, available, wait, type, modify, link);
      console.log("E-book: Located in Overdrive");

  } catch (e) {
    
      console.log("E-book: Not located in Overdrive");
      failureMessage(type,"not_located",url,modify);

  }

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

  if (wait.match(/^[0-9]+$/) !== null && wait.match(/^0$/) === null && available.match(/^0$/) !== null && total.match(/^[0-9]+$/) !== null) {
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