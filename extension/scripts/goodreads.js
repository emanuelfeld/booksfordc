if (/goodreads\.com$/.test(document.domain)) {
    LOG('initialize: goodreads.com')
    setUp('goodreads');
}


function initLayout (site, preferences) {
    var container;

    if ($('div.rightContainer').length) {
        container = $('div.rightContainer:first');
        container.prepend("<div id='bfdc-"+ site + "'>" + innerLayout + "</div>");
    } else {
        LOG('error: could not create ' + site + ' page box');
        return false;
    }

    finishLayout(preferences);
    LOG('initialize: created ' + site + ' page box');

    optionsListener();

    return true;

}


function getTitle () {
    LOG('initialize: locating title');
    var title = $('#bookTitle').text().replace(/^\n */, '');
    return title;
}


function getAuthor () {
    LOG('initialize: locating author');
    var author = $('.authorName:eq(0)').text();
    return author;
}


function getISBN () {
    LOG('initialize: locating isbn');
    var isbn, isbn10, isbn13;

    isbn10 = $("#bookDataBox div:contains('ISBN')").text() || '';
    isbn13 = $("div .infoBoxRowItem:contains('ISBN13')").text() || '';

    if (isbn13.length) {
        isbn = isbn13.split(':')[1].replace(/\D/g, '');
    } else if (isbn10.length) {
        isbn10 = isbn10.replace(/\D/g, '').substr(0, 10);
        isbn = convertISBN(isbn10);
    } else {
        isbn = '';
    }

    return isbn;
}
