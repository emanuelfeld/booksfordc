if (/goodreads\.com$/.test(document.domain)) {
  console.log = function () {}
  getPrefsGoodreads();
}

function getPrefsGoodreads () {
  chrome.storage.sync.get(['bookMedia', 'ebookMedia', 'audioMedia', 'openTabs'], function (items) {
    checkGoodreads(items['audioMedia'], items['ebookMedia'], items['bookMedia'], items['openTabs']);
  });
}

function checkGoodreads (showAudio, showEbook, showBook, openTabs) {
  var page_info = goodreadsPageInfo();

  if (page_info['on_page']) {
    resultTarget = openTabs ? '_blank' : '_self';
    console.log(resultTarget);
    goodreadsMakeBox(showAudio, showEbook, showBook);
    searchGuide(page_info['author'], page_info['title'], page_info['isbn']);
    initiateSearch(page_info, showAudio, showEbook, showBook);
  }
}

function goodreadsMakeBox (showAudio, showEbook, showBook) {
  var container;

  if ($('div.rightContainer').length) {
    console.log('Initialize: Creating Goodreads page box');
    container = $('div.rightContainer:first');
    container.prepend(
      "<div id = 'dcpl_goodreads'>\
        <div id = 'booksfordc_icon'> <a href = 'http://booksfordc.org' > <img id = 'booksfordc_icon_img' src = '" + chrome.extension.getURL('assets/icon16white.png') + "'> </a> </div>\
        <div id = 'booksfordc_availability'> \
          <div id = 'dcpl_title'> DCPL Search </div> \
        </div> \
      </div> ");

  finishBox(showAudio, showEbook, showBook);

  return true;
  } else {
    console.log('Initialize: Could not create Goodreads page box');
    return false;
  }
}

function goodreadsPageInfo () {
  var title, isbn, isbn13, isbn10, author, on_page;

  isbn10 = $("#bookDataBox div:contains('ISBN')").text();
  isbn13 = $("div .infoBoxRowItem:contains('ISBN13')").text();

  if (isbn13.length) {
    isbn = isbn13.split(':')[1].replace(/\D/g, '');
  } else if (isbn10.length) {
    isbn10 = isbn10.replace(/\D/g, '').substr(0, 10);
    isbn = convertISBN(isbn10);
  }

  title = $('#bookTitle').text().replace(/^\n */, '');
  author = $('.authorName:eq(0)').text();

  if (title || isbn) {
    on_page = true;
  }

  var result = {
    'on_page': on_page,
    'author': cleanAuthor(author),
    'title': cleanTitle(title),
    'isbn': isbn
  };

  console.log(result);
  return result;
}
