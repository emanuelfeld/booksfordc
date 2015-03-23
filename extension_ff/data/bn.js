var on_page = bnMakeBox();

if (on_page !== false) {

  var modify_library = on_page[0];
  var modify_digital = on_page[1];

  var page_info = bnPageInfo(),
      search_urls = searchURLs(page_info['author'], page_info['title'], page_info['isbn']);

  if (page_info['isbn'] === null) {
    //Book: Searching catalog by title and author
    searchSirsi(search_urls['bookURL'], "text", modify_library, "Book", page_info);
  } else {
    //Book: Searching catalog by ISBN
    searchSirsi(search_urls['isbnURL'], "isbn", modify_library, "Book", page_info);
  }
  searchOverdrive(search_urls['overdriveSearchURL'], search_urls['overdriveURL'], "text", modify_digital, "E-book", page_info);
}

function bnMakeBox() {

    if ($('#top-content-book-1').length) {
      //Initialize: Creating Barnes and Noble page box
      var booksfordc = document.getElementById("top-content-book-1");
 
      var booksfordc_box = document.createElement('div');
      booksfordc_box.id = "dcpl_bn";
      booksfordc.insertBefore(booksfordc_box, booksfordc.firstChild);
 
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
 
      self.port.on("imageurl", function(gifurl) {
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
  
    } else {
      //Initialize: Could not create Barnes and Noble page box
      return false;
    }
  }
  //Determine whether on book page

function bnPageInfo() {
 
  var success, page_type, title, isbn, isbn13, author;
 
  if ($('#product-title-1').length) {
    
    success = true;
    title = $('#product-title-1 h1').text();
    isbn13 = $(".product-details ul li:first").text();
    isbn = isbn13.split(':')[1].replace(/\D/g, '');
    if ($('.contributors a:eq(0)').length) {
      author = $(".contributors a:eq(0)").text();
    } else {
      author = $(".contributors a").text();
    }
  } else {
    //Initialize: Not on Barnes and Noble book or ebook page
    success = false;
    page_type = "";
    author = "";
    title = "";
    isbn = "";
  }
 
  var result = {
    "success": success,
    "page_type": page_type,
    "author": cleanAuthor(author),
    "title": cleanTitle(title),
    "isbn": isbn
  };

  return result;
}

