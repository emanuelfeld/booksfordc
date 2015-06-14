console.log = function() {}

function cleanTitle(title) {
  console.log("Initialize: Title cleaned");
  return title.replace(/\(.*\)/g, "").replace(/\[.*\]/, "").replace(/^\s*(.*?)\s*$/, "$1");
}

function overdriveTitle(title) {
  return title.replace(/:.*/, "");
}

function cleanAuthor(author) {
  console.log("Initialize: Author cleaned");
  return author.replace("Ph.D.", "").replace(/ +$/, "");
}

function overdriveAuthor(author) {
  return author.replace(/([A-Z]\.)+/g, "");
}

function convertISBN(isbn10) {
  console.log("Initialize: Converting ISBN-10 to ISBN-13");
  var isbn = "978" + isbn10.substring(0, isbn10.length - 1);
  isbn = isbn + checkDigit(isbn);
  return isbn;
}

function checkDigit(isbn) {
  var sum = 0
  for (var i = 1; i < isbn.length + 1; i++) {
    if (i % 2 === 0) {
      sum += parseInt(isbn.charAt(i - 1)) * 3;
    } else {
      sum += parseInt(isbn.charAt(i - 1));
    }
  }
  var check = (10 - sum % 10) % 10;
  return check.toString();
}

function finishBox(showAudio, showEbook, showBook) {

  if (showAudio) {
    $('#dcpl_title:eq(0)').after(
      " <div id = 'category'> Audiobooks </div> <div id = 'audio' class='digital'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div>");
  }

  if (showEbook) {
    $('#dcpl_title:eq(0)').after(
      " <div id = 'category'> E-books </div> <div id = 'ebook' class='digital'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div>");
  }

  if (showBook) {
    $('#dcpl_title:eq(0)').after(
      " <div id = 'category'> Books </div> <div id = 'book'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> ");
  }

  if ((showAudio === false && showEbook === false && showBook === false) || (showAudio === undefined && showEbook === undefined && showBook === undefined)) {
    $('#dcpl_title:eq(0)').after(" <div id = 'book'> <a href = 'chrome-extension://plbkclaloadjhljkijjnlingopbahndg/options.html' target='_blank'> Click here to set your search preferences </a> ");
  }
}

function initiateSearch(page_info, search_urls, showAudio, showEbook, showBook) {

  if (showBook) {
    if (page_info['isbn'] === null | page_info['isbn'] === "") {
      console.log("Book: Searching catalog by title and author")
      searchSirsi(search_urls['bookURL'], "text", $("div#book"), "Book", page_info, search_urls);
    } else {
      console.log("Book: Searching catalog by ISBN")
      searchSirsi(search_urls['isbnURL'], "isbn", $("div#book"), "Book", page_info, search_urls);
    }
  }
  if (showEbook) {
    searchOverdrive(search_urls['ebookSearchURL'], search_urls['overdriveURL'], "text", $("div#ebook"), "E-book", page_info, search_urls);
  }
  if (showAudio) {
    searchOverdrive(search_urls['audioSearchURL'], search_urls['overdriveURL'], "text", $("div#audio"), "Audiobook", page_info, search_urls);
  }

}

function searchURLs(author, title, isbn) {
  console.log("Initialize: Establishing URLs");
  var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
  return {
    "isbnURL": base + isbn + "&te=&lm=BOOKS",
    "bookURL": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&qu=-%22sound+recording%22&te=&lm=BOOKS",
    "altBookURL": base + encodeURIComponent(overdriveTitle(title) + " " + author).replace(/'/g, "%27") + "&qu=-%22sound+recording%22&te=&lm=BOOKS",
    "ebookSearchURL": "http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria=" + encodeURIComponent(overdriveTitle(title) + " " + overdriveAuthor(author)) + "&x=0&y=0&Format=420%2C50%2C410%2C450%2C610%2C810%2C303",
    "audioSearchURL": "http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria=" + encodeURIComponent(overdriveTitle(title) + " " + overdriveAuthor(author)) + "&x=0&y=0&Format=425",
    "purchaseURL": "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X",
    "overdriveURL": "http://overdrive.dclibrary.org"
  }
}

function searchSirsi(search_url, search_by, modify, type, info, search_urls) {
  $.get(search_url, function(data) {
    oneline = $(data).text().replace(/\n/g, "");
    if (type === "Book") {
      sirsiAvailability(oneline, search_url, search_by, modify, type, info, search_urls);
    }
  });
}

function searchOverdrive(search_url, fail_url, search_by, modify, type, info, search_urls) {
  console.log(type + ": Searching Overdrive");
  chrome.runtime.sendMessage({
      method: 'GET',
      action: 'xhttp',
      url: search_url
    },
    function(response) {
      var result = $(response);
      overdriveAvailability(result, fail_url, modify, type, info, search_urls);
    });

}

function sirsiAvailability(oneline, url, search_by, modify, type, info, search_urls) {

  try {
    var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/, "$1"));
    available = availabilityJSON['totalAvailable'].toString(),
      total = availabilityJSON['copies'][0].match(/(\d+)$/)[1],
      wait = availabilityJSON['holdCounts'][0].match(/(\d+)$/)[1];

    successMessage(total, available, wait, type, modify, url, search_urls);
    console.log("Book: Located in catalog");
  } catch (e) {
    if (search_by === "isbn") {
      console.log("Book: Search by ISBN failed\nBook: Searching catalog by title and author");
      console.log(info);
      searchSirsi(search_urls['bookURL'], "text_full", modify, type, info, search_urls);
    } else if (search_by === "text_full" && info['title'].match(/:/) !== null) {
      console.log("Book: Searching catalog without subtitle");
      searchSirsi(search_urls['altBookURL'], "text_short", modify, type, info, search_urls);
    } else if (oneline.match("This search returned no results.") !== null) {
      console.log("Book: Not located in catalog");
      failureMessage(type, "not_located", url, modify, search_urls);
    } else {
      console.log("Book: Uncertain match in catalog");
      failureMessage(type, "uncertain", url, modify, search_urls);
    }
  }
}

function overdriveAvailability(result, url, modify, type, info, search_urls) {
  try {
    var availabilityInfo = result.find('.img-and-info-contain:eq(0)'),
      available = availabilityInfo.attr("data-copiesavail"),
      total = availabilityInfo.attr("data-copiestotal"),
      wait = availabilityInfo.attr("data-numwaiting");

    var view = result.find('.li-details a:eq(0)'),
      link = "http://overdrive.dclibrary.org/10/50/en/" + view.attr("href");

    successMessage(total, available, wait, type, modify, link, search_urls);
    console.log(type + ": Located in Overdrive");
  } catch (e) {
    console.log(type + ": Not located in Overdrive");
    failureMessage(type, "not_located", url, modify, search_urls);
  }
}

function successMessage(total, available, wait, type, modify, result_url, search_urls) {
  var total_statement, wait_statement;
  
  if (total.match(/^1$/) !== null) {
    total_statement = total + " copy";
  } else if (total.match(/^[0-9]+$/) !== null) {
    total_statement = total + " copies";
  }

  if (wait.match(/^1$/) !== null) {
    wait_statement = wait + " patron waiting";
  } else if (wait.match(/^[0-9]+$/) !== null) {
    wait_statement = wait + " patrons waiting";
  }

  if (wait.match(/^[0-9]+$/) !== null && wait.match(/^0$/) === null && available.match(/^0$/) !== null && total.match(/^[0-9]+$/) !== null) {
    modify.html("<a id='results' href = '" + result_url + "'>" + type + " located </a> <br>" + total_statement + " (" + wait_statement + ")");
  } else {
    modify.html("<a id='results' href = '" + result_url + "'>" + type + " located </a> <br>" + total_statement + " (" + available + " available)");
  }
}

function failureMessage(type, failure, failure_url, modify, search_urls) {
  var purchase_message, ebook_message;

  if (type === "Book") {
    purchase_message = "<br> <a id='results' href = '" + search_urls['purchaseURL'] + "'>Request purchase</a>";
    ebook_message = "";
  } else {
    purchase_message = "";
    ebook_message = "<br> <a id='results' href = '" + failure_url + "'>Search manually</a>";
  }

  if (failure === "not_located") {
    modify.html(type + " not located <br> <a id='results' href = '" + failure_url + "'>Search manually</a>" + purchase_message);
  } else {
    modify.html("Possible match located <br> <a id='results' href = '" + failure_url + "'>View results</a>" + ebook_message + purchase_message);
  }

}