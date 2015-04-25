self.port.on("details", function(details) {
  var preferences = details.prefs,
    resources = details.imageurl;

  var on_page = goodreadsMakeBox(preferences, resources);

  if (on_page !== false) {
    var page_info = goodreadsPageInfo();
    var search_urls = searchURLs(page_info['author'], page_info['title'], page_info['isbn']);

    initiateSearch(page_info, on_page, search_urls, preferences);
  }
});

function goodreadsMakeBox(preferences, resources) {
  if ($('div.rightContainer').length) {
    //Initialize: Creating Goodreads page box
    var booksfordc = document.getElementsByClassName("rightContainer")[0];

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
    booksfordc_box.id = "dcpl_goodreads";
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

    var no_search = document.createElement('div');
    no_search.id = "book";
    no_search.class = "booksfordc_search";
    no_search.textContent = "Go to your Firefox Add-ons Manager to set your search preferences";

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

    if ((preferences.includeAudio === false && preferences.includeEbook === false && preferences.includeBook === false) || (preferences.includeAudio === undefined && preferences.includeEbook === undefined && preferences.includeBook === undefined)) {
      booksfordc_availability.appendChild(no_search);
      no_search.appendChild(no_search_link);
    }

    return [library_results, ebook_results, audio_results];
  } 

    return false;
}

//Determine whether on book page
function goodreadsPageInfo() {

  var title, isbn, isbn13, isbn10, author;

  isbn10 = $("#bookDataBox div:contains('ISBN')").text();
  isbn13 = $("div .infoBoxRowItem:contains('ISBN13')").text();

  if (isbn13.length) {
    isbn = isbn13.split(':')[1].replace(/\D/g, '');  
  } else if (isbn10.length) {
    isbn10 = isbn10.replace(/\D/g, '').substr(0,10);
    isbn = convertISBN(isbn10);
  }

  title = $("#bookTitle").text().replace(/^\n */, '');
  author = $(".authorName:eq(0)").text();

  var result = {
    "author": cleanAuthor(author),
    "title": cleanTitle(title),
    "isbn": isbn
  };

  return result;
}
