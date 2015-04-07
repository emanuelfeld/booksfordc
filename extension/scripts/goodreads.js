if (/goodreads\.com$/.test(document.domain)) {

  console.log = function() {}

  function getPrefsGoodreads() {
    chrome.storage.sync.get(['bookMedia', 'ebookMedia', 'audioMedia'], function(items){
      checkGoodreads(items['audioMedia'], items['ebookMedia'], items['bookMedia']);
    });
  }

  var prefsGoodreads = getPrefsGoodreads();

  function checkGoodreads(showAudio, showEbook, showBook){

    var on_page = goodreadsMakeBox(showAudio, showEbook, showBook);

    if (on_page === true) {

      var page_info = goodreadsPageInfo(),
        search_urls = searchURLs(page_info['author'], page_info['title'], page_info['isbn']);

      initiateSearch(page_info, search_urls, showAudio, showEbook, showBook);
    }
  }
}

function goodreadsMakeBox(showAudio, showEbook, showBook) {
  var container;

  if ($('div.rightContainer').length) {
    console.log("Initialize: Creating Goodreads page box");
    container = $('div.rightContainer:first');
    container.prepend(
      " <div id = 'dcpl_goodreads'>\
          <div id = 'booksfordc_icon'> <img id = 'booksfordc_icon_img' src = '" + chrome.extension.getURL('assets/icon16white.png') +"'> </div>\
          <div id = 'booksfordc_availability'> \
            <div id = 'dcpl_title'> DCPL Search </div> \
          </div> \
        </div> ");

  finishBox(showAudio, showEbook, showBook);
  
  return true;

  } else {
    console.log("Initialize: Could not create Goodreads page box");
    return false;
  }
}


function goodreadsPageInfo() {

  var success, page_type, title, isbn, isbn13, author;

    isbn13 = $("div .infoBoxRowItem:contains('ISBN13')").text();
    isbn = isbn13.split(':')[1].replace(/\D/g, '');
    title = $("#bookTitle").text().replace(/^\n */, '');
    author = $(".authorName:eq(0)").text();
    success = true;
    
    var result =  { "success": success, "page_type": page_type, "author": cleanAuthor(author), "title": cleanTitle(title), "isbn": isbn };
    console.log(result);
    return result;
}

