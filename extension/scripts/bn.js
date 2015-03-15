if (/barnesandnoble\.com$/.test(document.domain)) {

	var on_page = bnMakeBox();

	if (on_page===true){

		var page_info = bnPageInfo(),
			search_urls = searchURLs(page_info['author'], page_info['title'],page_info['isbn']);

		if (page_info['isbn']===null){
			searchSirsi(search_urls['bookURL'], "text", $("div#book"), "Book", page_info);
		} else {
			searchSirsi(search_urls['isbnURL'],"isbn",$("div#book"), "Book", page_info);
		}
    searchOverdrive(search_urls['overdriveSearchURL'], search_urls['overdriveURL'], "text", $("div#digital"), "E-book", page_info);   
	}

}


//Create the div on the Amazon resource page to modify and initialize message
function bnMakeBox() {
	var container;

	if ($('#top-content-book-1').length) {
		console.log("Created page box");
		container = $('#top-content-book-1:eq(0)');
		container.prepend(
			"<div id='dcpl_bn'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') +
			"'> </div>  <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
			return true;
	} else {
		console.log("Could not create box");
		return false;
	}
}

//Determine whether on book page
function bnPageInfo() {

	var success, page_type, title, isbn, isbn13, author;

	if ($('#product-title-1').length) {
		console.log("On book page")
		success = true;
		title = $('#product-title-1 h1').text();
		isbn13 = $(".product-details ul li:first").text();
		isbn = isbn13.split(':')[1].replace(/\D/g, '');
		author = $(".contributors a").text();
		console.log(title);
		console.log(isbn13);
		console.log(isbn);
		console.log(author);

	} else {
		console.log("Not on book or ebook page");
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



