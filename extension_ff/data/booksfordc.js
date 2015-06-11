function cleanTitle(title) {
  return title.replace(/\(.*\)/g, "").replace(/\[.*\]/, "").replace(/^\s*(.*?)\s*$/, "$1");
}

function overdriveTitle(title) {
  return title.replace(/:.*/, "");
}

function cleanAuthor(author) {
  return author.replace("Ph.D.", "").replace(/ +$/, "");
}

function overdriveAuthor(author) {
  return author.replace(/([A-Z]\.)+/g, "");
}

function convertISBN(isbn10) {
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

function initiateSearch(page_info, on_page, search_urls, preferences) {
  var modify_library = on_page[0];
  var modify_digital = on_page[1];
  var modify_audio = on_page[2];
  if (preferences.includeBook) {
    if (page_info['isbn'] === "") {
      //Book: Searching catalog by title and author
      searchSirsi(search_urls['bookURL'], "text", modify_library, "Book", page_info, search_urls);
    } else {
      //Book: Searching catalog by ISBN
      searchSirsi(search_urls['isbnURL'], "isbn", modify_library, "Book", page_info, search_urls);
    }
  }
  if (preferences.includeEbook) {
    searchOverdrive(search_urls['ebookSearchURL'], search_urls['overdriveURL'], "text", modify_digital, "E-book",
      page_info, search_urls);
  }
  if (preferences.includeAudio) {
    searchOverdrive(search_urls['audioSearchURL'], search_urls['overdriveURL'], "text", modify_audio, "Audiobook",
      page_info, search_urls);
  }
}

function searchURLs(author, title, isbn) {
  var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";

  return {
    "isbnURL": base + isbn + "&te=&lm=BOOKS",
    "bookURL": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&qu=-%22sound+recording%22&te=&lm=BOOKS",
    "altBookURL": base + encodeURIComponent(overdriveTitle(title) + " " + author).replace(/'/g, "%27") + "&te=&lm=BOOKS",
    "ebookSearchURL": "http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria=" + encodeURIComponent(overdriveTitle(title) + " " + overdriveAuthor(author)) + "&x=0&y=0&Format=420%2C50%2C410%2C450%2C610%2C810%2C303",
    "audioSearchURL": "http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria=" + encodeURIComponent(overdriveTitle(title) + " " + overdriveAuthor(author)) + "&x=0&y=0&Format=425",
    "purchaseURL": "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X",
    "overdriveURL": "http://overdrive.dclibrary.org"
  };
}

function searchSirsi(search_url, search_by, modify, type, info, search_urls) {
  function sirsiListener() {
    var oneline = this.responseText.replace(/\n/g, "");
    if (type === "Book") {
      sirsiAvailability(oneline, search_url, search_by, modify, type, info, search_urls);
    }
  }
  var sReq = new XMLHttpRequest();
  sReq.onload = sirsiListener;
  sReq.open("get", search_url, true);
  sReq.send();
  console.log("Searching Sirsi")
}

function searchOverdrive(search_url, fail_url, search_by, modify, type, info, search_urls) {
  function overdriveListener() {
    var result = $(this.response);
    overdriveAvailability(result, fail_url, modify, type, info, search_urls);
  }
  var oReq = new XMLHttpRequest();
  oReq.onload = overdriveListener;
  oReq.open("get", search_url, true);
  oReq.send();
  console.log("Searching overdrive")
}

function sirsiAvailability(oneline, url, search_by, modify, type, info, search_urls) {
  var test = oneline.match(/parseDetailAvailabilityJSON/);
  if (test !== null) {
    var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/, "$1"));
      available = availabilityJSON['totalAvailable'].toString(),
      total = availabilityJSON['copies'][0].match(/(\d+)$/)[1],
      wait = availabilityJSON['holdCounts'][0].match(/(\d+)$/)[1];
    successMessage(total, available, wait, type, modify, url);
  } else if (search_by === "isbn") {
    searchSirsi(search_urls['bookURL'], "text_full", modify, type, info, search_urls);
  } else if (search_by === "text_full" && info['title'].match(/:/) !== null) {
    searchSirsi(search_urls['altBookURL'], "text_short", modify, type, info, search_urls);
  } else if (oneline.match("This search returned no results.") !== null) {
    failureMessage(type, "not_located", url, modify, search_urls);
  } else {
    failureMessage(type, "uncertain", url, modify, search_urls);
  }
}

function overdriveAvailability(result, url, modify, type, info, search_urls) {
  try {
    var availabilityInfo = result.find('.img-and-info-contain:eq(0)');
    var available = availabilityInfo.attr("data-copiesavail");
    var total = availabilityInfo.attr("data-copiestotal");
    var wait = availabilityInfo.attr("data-numwaiting");
    var view = result.find('.li-details a:eq(0)');
    var link = "http://overdrive.dclibrary.org/10/50/en/" + view.attr("href");
    successMessage(total, available, wait, type, modify, link);
  } catch (e) {
    failureMessage(type, "not_located", url, modify, search_urls);
  }
}

function successMessage(total, available, wait, type, modify, result_url) {
  var total_statement, wait_statement;
  var result_message = document.createElement('a');
  var available_message = document.createElement('div');
  result_message.id = "results";
  available_message.id = "results";
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
  modify.textContent = "";
  result_message.textContent = type + " located";
  result_message.href = result_url;
  if (wait.match(/^[0-9]+$/) !== null && wait.match(/^0$/) === null && available.match(/^0$/) !== null && total.match(
    /^[0-9]+$/) !== null) {
    available_message.textContent = total_statement + " (" + wait_statement + ")";
  } else {
    available_message.textContent = total_statement + " (" + available + " available)";
  }
  modify.appendChild(result_message);
  modify.appendChild(available_message);
}

function failureMessage(type, failure, failure_url, modify, search_urls) {
  modify.textContent = "";
  var failure_div = document.createElement('div'),
    alt_div = document.createElement('div'),
    alt_message = document.createElement('a'),
    purchase_div = document.createElement('div'),
    purchase_message = document.createElement('a');
  if (failure === "not_located") {
    failure_div.textContent = type + " not located";
    alt_message.textContent = "Search manually";
    alt_message.href = failure_url;
  } else {
    failure_div.textContent = "Possible match located";
    alt_message.textContent = "View results";
    alt_message.href = failure_url;
  }
  modify.appendChild(failure_div);
  failure_div.appendChild(alt_div);
  alt_div.appendChild(alt_message);
  if (type === "Book") {
    failure_div.appendChild(purchase_div);
    purchase_message.textContent = "Request purchase";
    purchase_message.href = search_urls['purchaseURL'];
    purchase_div.appendChild(purchase_message);
  }
}