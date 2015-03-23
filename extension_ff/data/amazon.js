
	var on_page = makeBox();

	if (on_page===true){

		var page_info = pageInfo(),
			search_urls = searchURLs(page_info['author'], page_info['title'],page_info['isbn']);

		if (page_info['isbn']===null){
			console.log("Book: Searching catalog by title and author")
			searchSirsi(search_urls['bookURL'], "text", $("div#book"), "Book", page_info);
		} else {
			console.log("Book: Searching catalog by ISBN")
			searchSirsi(search_urls['isbnURL'],"isbn",$("div#book"), "Book", page_info);
		}
    searchOverdrive(search_urls['overdriveSearchURL'], search_urls['overdriveURL'], "text", $("div#digital"), "E-book", page_info);   
	}



//Create the div on the Amazon resource page to modify and initialize message
function makeBox() {
	var container;

	if ($('div.kicsBoxContents').length) {
		console.log("Initialize: Creating Amazon e-book page box");
		container = $('div.kicsBoxContents:first');
		container.before(
		      " <div id='dcpl_digital'>\
		        <div id = 'booksfordc_icon' class = 'amazon'> </div>\
		        <div id = 'booksfordc_availability'> \
		          <div id = 'dcpl_title'> DCPL Search </div> \
		          <div id = 'category'> Library Catalog </div> \
		          <div id = 'book' class = 'booksfordc_search'> Searching catalog </div> \
		          <div id = 'category'> Digital Catalog </div> \
		          <div id = 'digital' class = 'booksfordc_search'> Searching catalog </div> \
		        </div> \
		      </div> ");	    
	    image1_container = $('.booksfordc_search');
	    image2_container = $('#booksfordc_icon');
	    self.port.on("imageurl", function(gifurl){
	      var img1 = document.createElement("img");
	      img1.src = gifurl[0];
	      var img2 = document.createElement("img");
	      img2.src = gifurl[1];
	      img2.id = 'booksfordc_icon_img'      
	      image1_container.append(img1);
	      image2_container.append(img2);
	    });
		return true;
	} else if ($('div.a-box.rbbSection.selected.dp-accordion-active').length) {
		console.log("Initialize: Creating Amazon book page box");
		container = $('div.a-box.rbbSection.selected.dp-accordion-active');
		container.prepend(
		      " <div id='dcpl' class='a-box'>\
		        <div id = 'booksfordc_icon' class = 'amazon'> </div>\
		        <div id = 'booksfordc_availability'> \
		          <div id = 'dcpl_title'> DCPL Search </div> \
		          <div id = 'category'> Library Catalog </div> \
		          <div id = 'book' class = 'booksfordc_search'> Searching catalog </div> \
		          <div id = 'category'> Digital Catalog </div> \
		          <div id = 'digital' class = 'booksfordc_search'> Searching catalog </div> \
		        </div> \
		      </div> ");	    
	    image1_container = $('.booksfordc_search');
	    image2_container = $('#booksfordc_icon');
	    self.port.on("imageurl", function(gifurl){
	      var img1 = document.createElement("img");
	      img1.src = gifurl[0];
	      var img2 = document.createElement("img");
	      img2.src = gifurl[1];      
	      img2.id = 'booksfordc_icon_img'      
	      image1_container.append(img1);
	      image2_container.append(img2);
	    });
		return true;
	} else if ($('div#unqualifiedBuyBox').length) {
		console.log("Initialize: Creating Amazon used book page box");
		container = $('div#unqualifiedBuyBox');
		container.prepend(
		      " <div id='dcpl' class='a-box'>\
		        <div id = 'booksfordc_icon' class = 'amazon'> </div>\
		        <div id = 'booksfordc_availability'> \
		          <div id = 'dcpl_title'> DCPL Search </div> \
		          <div id = 'category'> Library Catalog </div> \
		          <div id = 'book' class = 'booksfordc_search'> Searching catalog </div> \
		          <div id = 'category'> Digital Catalog </div> \
		          <div id = 'digital' class = 'booksfordc_search'> Searching catalog </div> \
		        </div> \
		      </div> ");	    
	    image1_container = $('.booksfordc_search');
	    image2_container = $('#booksfordc_icon');
	    self.port.on("imageurl", function(gifurl){
	      var img1 = document.createElement("img");
	      img1.src = gifurl[0];
	      var img2 = document.createElement("img");
	      img2.src = gifurl[1];      
	      img2.id = 'booksfordc_icon_img'      
	      image1_container.append(img1);
	      image2_container.append(img2);
	    });
		return true;
	} else {
		console.log("Initialize: Could not create Amazon page box");
		return false;
	}
}

//Determine whether on book page
function pageInfo() {

	var success, page_type, title, isbn, isbn10, isbn13, author;

	if ($('#btAsinTitle').length) {
		console.log("Initialize: On Amazon e-book page")
		success = true;
		page_type = "ebook_page";
		title = $('#btAsinTitle').text();
		console.log(title);
		if ($('#pageCountAvailable').length) {
			try {
				isbn10 = $('#hardcover_meta_binding_winner').find('.bucketBorderTop').attr("id").split('_')[1].replace(/\D/g, '');
				isbn = convertISBN(isbn10);				
			} catch (e) {
				isbn = "";
			}
		} else {
			isbn = "";
		}
		if ($('.contributorNameTrigger a:eq(0)').length) {
			author = $('.contributorNameTrigger a:eq(0)').text();
		} else if ($('.contributorNameTrigger a').length) {
			author = $('.contributorNameTrigger a').text();
		} else if ($('div.buying span a:eq(0)').length){
			author = $('div.buying span a:eq(0)').text();
		} else {
			author = $('div.buying span a').text();			
		}
	} else if ($("#productDetailsTable .content li:contains('ISBN')").length) {
		console.log("Initialize: On Amazon book page");
		success = true;
		page_type = "book_page";
		title = $('#productTitle').text();
		isbn10 = $("#productDetailsTable .content li:contains('ISBN-10:')").text();
		isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
		if (isbn13.length){
			isbn = isbn13.split(':')[1].replace(/\D/g, '');
		} else {
			isbn10 = isbn10.split(':')[1].replace(/\D/g, '');
			isbn = convertISBN(isbn10);
		}
		if ($('.a-link-normal.contributorNameID:first').length) {
			author = $('.a-link-normal.contributorNameID:first').text();
		} else {
			author = $('.author .a-link-normal:eq(0)').text();
		}
	} else {
		console.log("Initialize: Not on Amazon book or e-book page");
		success = false;
		page_type = "";	
		author = "";
		title = "";
		isbn = "";
	}

    var result =  { "success": success, "page_type": page_type, "author": cleanAuthor(author), "title": cleanTitle(title), "isbn": isbn };
    console.log(result);
    return result;
}

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

	function sirsiListener () {
	  var oneline = this.responseText.replace(/\n/g, "");
	    if (type=="Book") {
	      sirsiAvailability(oneline, search_url, search_by, modify, type, info);
	    } 
	}

	var sReq = new XMLHttpRequest();
	sReq.onload = sirsiListener;
	sReq.open("get", search_url, true);
	sReq.send();
}

function searchOverdrive(search_url, fail_url, search_by, modify, type, info) {
  console.log("E-book: Searching Overdrive");

	function overdriveListener () {
	  	var result = $(this.response);
	  	overdriveAvailability(result, fail_url, modify, type, info);
  }
	
	var oReq = new XMLHttpRequest();
	oReq.onload = overdriveListener;
	oReq.open("get", search_url, true);
	oReq.send();
}

function sirsiAvailability(oneline, url, search_by, modify, type, info) {

	var test = oneline.match(/parseDetailAvailabilityJSON/);

	if (test!=null) {
      var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/, "$1"));
        available = availabilityJSON['totalAvailable'].toString(),
        total = availabilityJSON['copies'][0].match(/(\d+)$/)[1],
        wait = availabilityJSON['holdCounts'][0].match(/(\d+)$/)[1];

      console.log("Book: Located in catalog");
      successMessage(total, available, wait, type, modify, url);	

	} else if (search_by==="isbn") {
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

function overdriveAvailability(result, url, modify, type, info) {

	console.log("Determining Overdrive Availability");
 try {

        var availabilityInfo = result.find('.img-and-info-contain:eq(0)'),
            available = availabilityInfo.attr( "data-copiesavail" ),
            total = availabilityInfo.attr( "data-copiestotal" ),
            wait = availabilityInfo.attr( "data-numwaiting" );

        var view = result.find('.li-details a:eq(0)'),
            link = "http://overdrive.dclibrary.org/10/50/en/"+view.attr("href");

      console.log("E-book: Located in Overdrive");
      successMessage(total, available, wait, type, modify, link);

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

