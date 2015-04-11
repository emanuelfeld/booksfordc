
var on_page = makeBox();

if (on_page !== false) {

  var modify_library = on_page[0];
  var modify_digital = on_page[1];

  var page_info = pageInfo(),
    search_urls = searchURLs(page_info.author, page_info.title, page_info.isbn);
  if (page_info.isbn === null) {

    //Book: Searching catalog by title and author
    searchSirsi(search_urls.bookURL, "text", modify_library, "Book", page_info);
  } else {
    //Book: Searching catalog by ISBN
    searchSirsi(search_urls.isbnURL, "isbn", modify_library, "Book", page_info);
  }
  searchOverdrive(search_urls.overdriveSearchURL, search_urls.overdriveURL, "text", modify_digital, "E-book", page_info);
}

//Create the div on the Amazon resource page to modify and initialize message
function makeBox() {
  // IK: where is box_class var used anywhere?
  var booksfordc, box_class;
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

    var booksfordc_icon = document.createElement('div');
    booksfordc_icon.id = "booksfordc_icon";
    booksfordc_box.appendChild(booksfordc_icon);

    var booksfordc_availability = document.createElement('div');
    booksfordc_availability.id = "booksfordc_availability";
    booksfordc_box.appendChild(booksfordc_availability);

    var dcpl_title = document.createElement('div');
    dcpl_title.id = "dcpl_title";
    dcpl_title.textContent = "DCPL Search";
    booksfordc_availability.appendChild(dcpl_title);

    var library_category = document.createElement('div');
    library_category.id = "category";
    library_category.textContent = "Library Catalog";
    booksfordc_availability.appendChild(library_category);

    var library_results = document.createElement('div');
    library_results.id = "book";
    library_results.class = "booksfordc_search";
    library_results.textContent = "Searching catalog ";
    booksfordc_availability.appendChild(library_results);

    var digital_category = document.createElement('div');
    digital_category.id = "category";
    digital_category.textContent = "Digital Catalog";
    booksfordc_availability.appendChild(digital_category);

    var digital_results = document.createElement('div');
    digital_results.id = "digital";
    digital_results.class = "booksfordc_search";
    digital_results.textContent = "Searching catalog ";
    booksfordc_availability.appendChild(digital_results);

    self.port.on("imageurl",
      function (gifurl) {
        var img0 = document.createElement("img");
        img0.src = gifurl[0];
        var img1 = document.createElement("img");
        img1.src = gifurl[0];
        var img2 = document.createElement("img");
        img2.src = gifurl[1];
        img2.id = 'booksfordc_icon_img';
        library_results.appendChild(img0);
        digital_results.appendChild(img1);
        booksfordc_icon.appendChild(img2);
      });

    return [library_results, digital_results];

  }
  return valid;
}

//Determine whether on book page
function pageInfo() {

  var success, page_type, title, isbn, isbn10, isbn13, author;

  if ($('#btAsinTitle').length) {

    success = true;
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

    success = true;
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
  } else {

    success = false;
    page_type = "";
    author = "";
    title = "";
    isbn = "";
  }

  var result =  { "success": success, "page_type": page_type, "author": cleanAuthor(author), "title": cleanTitle(title), "isbn": isbn };

  return result;
}
