if (/amazon\.com$/.test(document.domain)) {
  console.log = function () {}
  getPrefsAmazon();
}

function getPrefsAmazon () {
  chrome.storage.sync.get(['bookMedia', 'ebookMedia', 'audioMedia', 'openTabs'], function (items) {
    checkAmazon(items['audioMedia'], items['ebookMedia'], items['bookMedia'], items['openTabs']);
  });
}

function checkAmazon (showAudio, showEbook, showBook, openTabs) {
  var page_info = pageInfo();

  if (page_info['on_page']){
    resultTarget = openTabs ? '_blank' : '_self';
    console.log(resultTarget);
    makeBox(showAudio, showEbook, showBook);
    searchGuide(page_info['author'], page_info['title'], page_info['isbn']);
    initiateSearch(page_info, showAudio, showEbook, showBook);
  }
}

// Create the div on the Amazon resource page to modify and initialize message
function makeBox (showAudio, showEbook, showBook) {
  var container;

  if ($('div#mediaTabsGroup').length) {
    container = $('#mediaTab_content_landing > div');
    container.before("<div id='dcpl_amzn_new'>\
                      <div id = 'booksfordc_icon' class = 'amazon'> <a href = 'http://booksfordc.org' > <img id = 'booksfordc_icon_img' src = '" + chrome.extension.getURL('assets/icon16white.png') + "'> </a> </div>\
                      <div id = 'booksfordc_availability'> \
                        <div id = 'dcpl_title'> DCPL Search </div> \
                      </div> \
                      </div> ");
  } else if ($('div.a-box-inner').length) {
    console.log('Initialize: Creating Amazon page box');
    container = $('#buybox');
    container.before("<div id='dcpl' class='a-box'>\
                      <div id = 'booksfordc_icon' class = 'amazon'> <a href = 'http://booksfordc.org' > <img id = 'booksfordc_icon_img' src = '" + chrome.extension.getURL('assets/icon16white.png') + "'> </a> </div>\
                      <div id = 'booksfordc_availability'> \
                        <div id = 'dcpl_title'> DCPL Search </div> \
                      </div> \
                      </div> ");
  } else {
    console.log('Initialize: Could not create Amazon page box');
    return false;
  }

  finishBox(showAudio, showEbook, showBook);

  return true;
}

// Determine whether on book page
function pageInfo () {
  var page_type, title, isbn, isbn10, isbn13, author, on_page;


  title = $('[id*="roductTitle"]:first')
    .text() || $('#btAsinTitle')
    .text() || '';

  isbn = $("li:contains('ISBN-13')").text() ||
    $("li:contains('ISBN-10')").text() ||
    $('#hardcover_meta_binding_winner').find('.bucketBorderTop').attr('id') ||
    $('#aboutEbooksSection span').attr('data-a-popover');

  try {
    isbn = isbn.match(/[0-9X]{10,13}/)[0]
    if (isbn.length === 10) {
      isbn = convertISBN(isbn);
    }
  } catch(e) {
    isbn = '';
  }

  author = $('[class*="contributorName"]:first')
    .text() || $('span.author a:first')
    .text() || '';

  if ((title && author) || isbn) {
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
