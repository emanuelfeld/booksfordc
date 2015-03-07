if (/amazon\.com$/.test(document.domain)) {
	makeBox();
	var page_info = pageInfo();
	var search_urls = searchURLs(page_info['author'], page_info['title'],page_info['isbn']);

	if (page_info['isbn']===null){
		searchSirsi(search_urls['bookURL'], "text", $("div#book"), "Book");
	} else {
		searchSirsi(search_urls['isbnURL'],"isbn",$("div#book"), "Book");
	}
	searchSirsi(search_urls['ebookURL'], "text", $("div#digital"), "E-book");

}

function makeBox() {
	if ($('div.kicsBoxContents').length) {
		var container = $('div.kicsBoxContents:first');
		container.before(
			"<div id='dcpl_digital'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') +
			"'> </div>  <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
	} else if ($('div.a-box.rbbSection.selected.dp-accordion-active').length) {
		var container = $('div.a-box.rbbSection.selected.dp-accordion-active');
		container.prepend(
			"<div id='dcpl' class='a-box'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') +
			"'> </div> <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
	} else if ($('div#unqualifiedBuyBox').length) {
		var container = $('div#unqualifiedBuyBox');
		container.prepend(
			"<div id='dcpl' class='a-box'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') +
			"'> </div> <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='" +
			chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> </div>");
	}
}

function searchURLs(author, title, isbn) {
	var base =
		"https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
	return {
		"isbnURL": base + isbn + "&te=&lm=BOOKS",
		"bookURL": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&te=&lm=BOOKS",
		"ebookURL": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&te=&lm=E-BOOK",
		"purchaseURL": "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X"
	}
}

function pageInfo() {
	var success, page_type, title, isbn, isbn13;

	if ($('#btAsinTitle').length) {
			success = true;
			page_type = "ebook_page";
			title = $('#btAsinTitle').text();
			isbn = "";
			if ($('.contributorNameTrigger a:eq(0)').length) {
				var author = $('.contributorNameTrigger a:eq(0)').text();
			} else if ($('.contributorNameTrigger a').length) {
				var author = $('.contributorNameTrigger a').text();
			} else {
				var author = $('div.buying span a').text();
			}
	} else if ($('#productTitle').length) {
			success = true;
			page_type = "book_page";
			title = cleanTitle($('#productTitle').text());
			isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
			isbn = isbn13.split(':')[1].replace(/\D/g, '');
			if ($('.a-link-normal.contributorNameID:first').length) {
				var author = $('.a-link-normal.contributorNameID:first').text();
			} else {
				var author = $('.author .a-link-normal:eq(0)').text();
			}
	} else {
			success = false;
			page_type = "";
			author = "";
			title = "";
			isbn = "";
	}
	return {
		"success": success,
		"page_type": page_type,
		"author": cleanAuthor(author),
		"title": cleanTitle(title),
		"isbn": isbn
	};
}

function cleanTitle(title) {
	return title.replace(/\(.*\)/g, "").replace(/\[.*\]/, "");
}

function cleanAuthor(author) {
	return author.replace("Ph.D.", "").replace(/ +$/, "");
}

function sirsiAvailability(oneline, url, search_by, modify, type) {
	try {
			var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/, "$1"));
			var available = availabilityJSON['totalAvailable'].toString();
			var total = availabilityJSON['copies'][0].match(/(\d+)$/)[1];
			var wait = availabilityJSON['holdCounts'][0].match(/(\d+)$/)[1];
			phrasing(total, available, wait, type, modify, url);
	} catch (e) {
		if (search_by==="isbn") {
			console.log("Now searching by title and author");
			searchSirsi(search_urls['bookURL'],"text",$("div#book"), "Book");
		} else if (oneline.match("This search returned no results.")!=null){
	      	 $("div#book").html("Book not located <br> <a id='results' href = '" + url + "'>Search manually</a> <br> <a id='results' href = '" + search_urls['purchaseURL'] + "'>Request purchase</a>");	            	
		} else {
	           $("div#book").html("Uncertain match <br> <a id='results' href = '" + url + "'>View results</a> <br> <a id='results' href = '" + search_urls['purchaseURL'] + "'>Request purchase</a>");
	       }	            
	}
}

function overdriveAvailability(oneline, url, modify, type) {
	var availability = oneline.replace(/.*Copies-Available:(\d+)Library copies:(\d+)var deNumWaiting = (\d+?)\;.*/,"$1,$2,$3");
    var available = availability.split(',')[0];
    var total = availability.split(',')[1];
    var wait = availability.split(',')[2];
   	phrasing(total, available, wait, type, modify, url);
}

function phrasing(total, available, wait, type, modify, url) {
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
	//SUCCESS
	if (wait.match(/^[0-9]+$/) !== null && wait.match(/^0$/) === null && available.match(
		/^0$/) !== null && total.match(/^[0-9]+$/) !== null) {
		modify.html("<a id='results' href = '" + url + "'>" + type + " located </a> <br>" + total_statement + " (" + wait_statement + ")");
	} else {
		modify.html("<a id='results' href = '" + url + "'>" + type + " located </a> <br>" + total_statement + " (" + available + " available)");
	}
}

function searchSirsi(search_url, search_by, modify, type) {
	$.get(search_url, function(data) {
		oneline = $(data).text().replace(/\n/g, "");
		if (type=="Book") {
			sirsiAvailability(oneline, search_url, search_by, modify, type);
		} else {
			searchOverdrive(oneline,search_url, "http://overdrive.dclibrary.org", modify, type);
		}
	});
}

function searchOverdrive(oneline, url, fail_url, modify, type) {
		var overdrive_id = oneline.replace(/.*{([A-Z0-9\-]+?)}.*/, "$1");
		if (overdrive_id.length > 100) {
			var overdrive_id = oneline.replace(/.*fOVERDRIVE\:(.+?)\$.*/, "$1");
		}
		if (overdrive_id.length < 100) {
			var overdrive_url = "http://overdrive.dclibrary.org/ContentDetails.htm?id=" + overdrive_id;
			$.get(overdrive_url,function(data){
				var oneline_overdrive = $(data).text().replace(/\n/g,"");
				overdriveAvailability(oneline_overdrive, overdrive_url, modify, type);
			});
		} else if (oneline.match("This search returned no results.")!=null){
	      	 modify.html(type + " not located <br> <a id='results' href = '" + fail_url + "'>Search manually</a>");	            	
		} else {
	        modify.html("Uncertain match <br> <a id='results' href = '" + url + "'>View results</a>");
		}            	
	}
