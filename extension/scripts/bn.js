if (/barnesandnoble\.com$/.test(document.domain)) {
    LOG('initialize: barnesandnoble.com')
    setUp('bn');
}


function initLayout (site, preferences) {
    var container = $('.format-content');

    if (container.length) {
        container.prepend("<div id='bfdc-bn'>" + innerLayout + "</div>");
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
    var title = $('#prodSummary h1').text();
    return title;
}


function getAuthor() {
    LOG('initialize: locating author');
    var author = $('.contributors a:first').text();
    return author;
}


function getISBN() {
    LOG('initialize: locating isbn');
    var isbn13 = $('#ProductDetailsTab dd:first').text() || '';
    var isbn = isbn13.replace(/\D/g, '');
    return isbn;
}
