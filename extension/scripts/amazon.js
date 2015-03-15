if (/amazon\.com$/.test(document.domain)) {

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

}


//Create the div on the Amazon resource page to modify and initialize message
function makeBox() {
	var container;

	if ($('div.kicsBoxContents').length) {
		console.log("Initialize: Creating Amazon e-book page box");
		container = $('div.kicsBoxContents:first');
		container.before(
			"<div id='dcpl_digital'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') +
			"'> </div>  <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
			return true;
	} else if ($('div.a-box.rbbSection.selected.dp-accordion-active').length) {
		console.log("Initialize: Creating Amazon book page box");
		container = $('div.a-box.rbbSection.selected.dp-accordion-active');
		container.prepend(
			"<div id='dcpl' class='a-box'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') +
			"'> </div> <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
			return true;
	} else if ($('div#unqualifiedBuyBox').length) {
		console.log("Initialize: Creating Amazon used book page box");
		container = $('div#unqualifiedBuyBox');
		container.prepend(
			"<div id='dcpl' class='a-box'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') +
			"'> </div> <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
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
		if ($('#pageCountAvailable').length) {
			isbn10 = $('#hardcover_meta_binding_winner').find('.bucketBorderTop').attr("id").split('_')[1].replace(/\D/g, '');
			isbn = convertISBN(isbn10);
		} else {
			isbn = "";
		}
		if ($('.contributorNameTrigger a:eq(0)').length) {
			author = $('.contributorNameTrigger a:eq(0)').text();
		} else if ($('.contributorNameTrigger a').length) {
			author = $('.contributorNameTrigger a').text();
		} else {
			author = $('div.buying span a').text();
		}
	} else if ($("#productDetailsTable .content li:contains('ISBN-13:')").length) {
		console.log("Initialize: On Amazon book page");
		success = true;
		page_type = "book_page";
		title = $('#productTitle').text();
		isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
		isbn = isbn13.split(':')[1].replace(/\D/g, '');
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



