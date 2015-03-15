if (/play\.google\.com$/.test(document.domain)) {

	var on_page = playMakeBox();

	if (on_page===true){

		var page_info = playPageInfo(),
			search_urls = searchURLs(page_info['author'], page_info['title'],page_info['isbn']);

	searchSirsi(search_urls['isbnURL'],"isbn",$("div#book"), "Book", page_info);
    
    searchOverdrive(search_urls['overdriveSearchURL'], search_urls['overdriveURL'], "text", $("div#digital"), "E-book", page_info);   
	}

}


//Create the div on the Amazon resource page to modify and initialize message
function playMakeBox() {
	var container;

	if ($('.info-container').length) {
		console.log("Created page box");
		container = $('.info-container:eq(0)');
		container.append(
			"<div id='dcpl_play'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
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
function playPageInfo() {

	var success, page_type, title, isbn, isbn13, author;

	success = true;
	title = $('.document-title').text();
	isbn13 = null;
	isbn = null;
	author = $(".book-author:eq(0)").text();
	if (author.length === 0) {
		author = $(".book-author-last:eq(0)").text();
	}
	console.log(title);
	console.log(isbn13);
	console.log(isbn);
	console.log(author);

    var result =  { "success": success, "page_type": page_type, "author": cleanAuthor(author), "title": cleanTitle(title), "isbn": isbn };
    console.log(result);
    return result;
}



