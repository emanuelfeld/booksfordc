self.port.on("details", function(details) {
	var preferences = details.prefs,
		resources = details.imageurl;

	var on_page = makeBox(preferences, resources);

	if (on_page !== false) {
		var page_info = pageInfo(),
			search_urls = searchURLs(page_info['author'], page_info['title'], page_info['isbn']);

		initiateSearch(page_info, on_page, search_urls, preferences);
	}
});


//Create the div on the Amazon resource page to modify and initialize message
function makeBox(preferences, resources) {
	var booksfordc, box_class
	var booksfordc_box = document.createElement('div');
	var valid = false;

	if ($('div.kicsBoxContents').length) {
		valid = true;
		booksfordc = document.getElementsByClassName("kicsBoxContents")[0];
		booksfordc_box.id = "dcpl_digital";
		booksfordc.insertBefore(booksfordc_box, booksfordc.firstChild);
	} else if ($('div.a-box.rbbSection.selected.dp-accordion-active').length) {
		valid = true;
		booksfordc = document.getElementsByClassName("a-box")[0];
		booksfordc_box.id = "dcpl";
		booksfordc_box.class = "a-box";
		booksfordc.insertBefore(booksfordc_box, booksfordc.firstChild);
	} else if ($('div#unqualifiedBuyBox').length) {
		valid = true;
		booksfordc = document.getElementById('unqualifiedBuyBox');
		booksfordc_box.id = "dcpl";
		booksfordc_box.class = "a-box";
		booksfordc.insertBefore(booksfordc_box, booksfordc.firstChild);
	}

	if (valid === true) {
		var img0 = document.createElement("img");
		img0.src = resources[0];

		var img1 = document.createElement("img");
		img1.src = resources[0];

		var img2 = document.createElement("img");
		img2.src = resources[0];

		var img3 = document.createElement("img");
		img3.src = resources[1];
		img3.id = 'booksfordc_icon_img';

		var booksfordc_icon = document.createElement('div');
		booksfordc_icon.id = "booksfordc_icon";
		booksfordc_box.appendChild(booksfordc_icon);
		booksfordc_icon.appendChild(img3);

		var booksfordc_availability = document.createElement('div');
		booksfordc_availability.id = "booksfordc_availability";
		booksfordc_box.appendChild(booksfordc_availability);

		var dcpl_title = document.createElement('div');
		dcpl_title.id = "dcpl_title";
		dcpl_title.textContent = "DCPL Search";
		booksfordc_availability.appendChild(dcpl_title);

		var library_category = document.createElement('div');
		library_category.id = "category";
		library_category.textContent = "Books";

		var library_results = document.createElement('div');
		library_results.id = "book";
		library_results.class = "booksfordc_search";
		library_results.textContent = "Searching catalog ";

		var ebook_category = document.createElement('div');
		ebook_category.id = "category";
		ebook_category.textContent = "E-books";

		var ebook_results = document.createElement('div');
		ebook_results.id = "ebook";
		ebook_results.class = "booksfordc_search";
		ebook_results.textContent = "Searching catalog ";

		var audio_category = document.createElement('div');
		audio_category.id = "category";
		audio_category.textContent = "Audiobooks";

		var audio_results = document.createElement('div');
		audio_results.id = "audio";
		audio_results.class = "booksfordc_search";
		audio_results.textContent = "Searching catalog ";

		if (preferences.includeBook === true) {
			booksfordc_availability.appendChild(library_category);
			booksfordc_availability.appendChild(library_results);
			library_results.appendChild(img0);
		}

		if (preferences.includeEbook === true) {
			booksfordc_availability.appendChild(ebook_category);
			booksfordc_availability.appendChild(ebook_results);
			ebook_results.appendChild(img1);
		}

		if (preferences.includeAudio === true) {
			booksfordc_availability.appendChild(audio_category);
			booksfordc_availability.appendChild(audio_results);
			audio_results.appendChild(img2);
		}

		return [library_results, ebook_results, audio_results];

	} 

		return valid;
}

//Determine whether on book page
function pageInfo() {
	var success, page_type, title, isbn, isbn10, isbn13, author;

	if ($('#btAsinTitle').length) {
		page_type = "ebook_page";
		title = $('#btAsinTitle').text();

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
		} else if ($('div.buying span a:eq(0)').length) {
			author = $('div.buying span a:eq(0)').text();
		} else {
			author = $('div.buying span a').text();
		}
	} else if ($("#productDetailsTable .content li:contains('ISBN')").length) {
		page_type = "book_page";
		title = $('#productTitle').text();
		isbn10 = $("#productDetailsTable .content li:contains('ISBN-10:')").text();
		isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
		if (isbn13.length) {
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
	} 

	var result = {
		"page_type": page_type,
		"author": cleanAuthor(author),
		"title": cleanTitle(title),
		"isbn": isbn
	};

	return result;
}