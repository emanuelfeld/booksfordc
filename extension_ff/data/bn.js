self.port.on("details", function(details) {
  var preferences = details.prefs,
    resources = details.imageurl;
  
  var on_page = bnMakeBox(preferences, resources);

  if (on_page !== false) {
    var page_info = bnPageInfo(),
      search_urls = searchURLs(page_info['author'], page_info['title'], page_info['isbn']);

    initiateSearch(page_info, on_page, search_urls, preferences);
  }
});


function bnMakeBox(preferences, resources) {

  if ($('#top-content-book-1').length) {
    var booksfordc = document.getElementById("top-content-book-1");

    var img0 = document.createElement("img");
    img0.src = resources[0];

    var img1 = document.createElement("img");
    img1.src = resources[0];

    var img2 = document.createElement("img");
    img2.src = resources[0];

    var img3 = document.createElement("img");
    img3.src = resources[1];
    img3.id = 'booksfordc_icon_img';

    var booksfordc_box = document.createElement('div');
    booksfordc_box.id = "dcpl_bn";
    booksfordc.insertBefore(booksfordc_box, booksfordc.firstChild);

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

  return false;
}

function bnPageInfo() {
  var success, title, isbn, isbn13, author;

  if ($('#product-title-1').length) {
    title = $('#product-title-1 h1').text();
    isbn13 = $(".product-details ul li:first").text();
    isbn = isbn13.split(':')[1].replace(/\D/g, '');
    if ($('.contributors a:eq(0)').length) {
      author = $(".contributors a:eq(0)").text();
    } else {
      author = $(".contributors a").text();
    }
  } 

  var result = {
    "author": cleanAuthor(author),
    "title": cleanTitle(title),
    "isbn": isbn
  };
  
  return result;
}