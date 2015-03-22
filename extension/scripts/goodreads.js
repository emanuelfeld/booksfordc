if (/goodreads\.com$/.test(document.domain)) {

  var on_page = goodreadsMakeBox();

  if (on_page === true){

    var page_info = goodreadsPageInfo(),
      search_urls = searchURLs(page_info['author'], page_info['title'],page_info['isbn']);

    if (page_info['isbn'] === null){
      console.log("Book: Searching catalog by title and author")
      searchSirsi(search_urls['bookURL'], "text", $("div#book"), "Book", page_info);
    } else {
      console.log("Book: Searching catalog by ISBN")
      searchSirsi(search_urls['isbnURL'],"isbn",$("div#book"), "Book", page_info);
    }
    searchOverdrive(search_urls['overdriveSearchURL'], search_urls['overdriveURL'], "text", $("div#digital"), "E-book", page_info);   
  }
}

function goodreadsMakeBox() {
  var container;

  if ($('div.rightContainer').length) {
    console.log("Initialize: Creating Goodreads page box");
    container = $('div.rightContainer:first');
    container.prepend(
      " <div id = 'dcpl_goodreads'>\
          <div id = 'booksfordc_icon'> <img id = 'booksfordc_icon_img' src = '" + chrome.extension.getURL('assets/icon16white.png') +"'> </div>\
          <div id = 'booksfordc_availability'> \
            <div id = 'dcpl_title'> DCPL Search </div> \
            <div id = 'category'> Library Catalog </div> \
            <div id = 'book'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> \
            <div id = 'category'> Digital Catalog </div> \
            <div id = 'digital'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> \
          </div> \
      </div> ");
      return true;
  } else {
    console.log("Initialize: Could not create Goodreads page box");
    return false;
  }
}


function goodreadsPageInfo() {

  var success, page_type, title, isbn, isbn13, author;

    isbn13 = $("div .infoBoxRowItem:contains('ISBN13')").text();
    isbn = isbn13.split(':')[1].replace(/\D/g,'');
    title = $("#bookTitle").text().replace(/^\n */,'');
    author = $(".authorName:eq(0)").text();
    success = true;
    
    var result =  { "success": success, "page_type": page_type, "author": cleanAuthor(author), "title": cleanTitle(title), "isbn": isbn };
    console.log(result);
    return result;
}

