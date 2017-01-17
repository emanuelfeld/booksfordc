if (/amazon\.com$/.test(document.domain)) {
    LOG('initialize: amazon.com')
    setUp('amazon');
}


function initLayout (site, preferences) {
    var container;

    if (!$("#nav-subnav").length) {
        return false;
    } 

    var mediaCategory = $('#nav-subnav').attr('data-category').toLowerCase();
    var isBook = ['books', 'book', 'digital-text', 'digital-texts'].indexOf(mediaCategory) > -1;

    if (!isBook) {
        return false;
    } else if ($('div#mediaTabsGroup').length) {
        container = $('#mediaTab_content_landing > div');
        container.before("<div id='bfdc-amazon-new'>" + innerLayout + "</div>");
    } else if ($('div.a-box-inner').length) {
        container = $('#buybox');
        container.before("<div id='bfdc-" + site + "' class='a-box'>" + innerLayout + "</div");
    } else {
        LOG('error: could not create ' + site + ' page box');
        return false;
    }

    finishLayout(preferences);
    LOG('initialize: created ' + site + ' page box');

    optionsListener();

    return true;
}


function getTitle() {
    LOG('initialize: locating title');
    var title = $('[id*="roductTitle"]:first')
        .text() || $('#btAsinTitle')
        .text() || '';

    return title;
}


function getAuthor() {
    LOG('initialize: locating author');
    var author = $('[class*="contributorName"]:first')
        .text() || $('span.author a:first')
        .text() || '';

    return author;
}


function getISBN() {
    LOG('initialize: locating isbn');
    var isbn = $("li:contains('ISBN-13')").text() ||
               $("li:contains('ISBN-10')").text() ||
               $('#hardcover_meta_binding_winner').find('.bucketBorderTop').attr('id') ||
               $('#aboutEbooksSection span').attr('data-a-popover') || '';

    isbn = isbn.replace(/[^\w\s]|_/g, "");

    try {
        isbn = isbn.match(/[0-9X]{10,13}/)[0];
        if (isbn.length === 10) {
            isbn = convertISBN(isbn);
        }
    } catch(e) {
        isbn = '';
    }

    return isbn;
}
