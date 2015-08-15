console.log = function() {}

//////////////////////////
/* JANITORIAL FUNCTIONS */
//////////////////////////

  function cleanTitle(title) {
    console.log("Initialize: Title cleaned");
    return title.replace(/\(.*\)/g, "").replace(/\[.*\]/, "").replace(/^\s*(.*?)\s*$/, "$1");
  }

  // Overdrive doesn't like subtitles, so remove any title bits after a colon. sometimes also useful for sirsi.
  function overdriveTitle(title) {
    return title.replace(/:.*/, "");
  }

  function cleanAuthor(author) {
    console.log("Initialize: Author cleaned");
    return author.replace("Ph.D.", "").replace(/ +$/, "");
  }

  // Overdrive doesn't like initials in names, so remove them
  function overdriveAuthor(author) {
    return author.replace(/([A-Z]\.)+/g, "");
  }

  // Sirsi doesn't recognize ISBN-10, so convert them to ISBN-13 using the following two functions.
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

/////////////////////
/* RESULTS DISPLAY */
/////////////////////

  // generic result display html
  function finishBox(showAudio, showEbook, showBook) {
    if (showAudio)
      $('#dcpl_title:eq(0)').after(" <div id = 'category'> Audiobooks </div> <div id = 'audio' class='digital'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div>");

    if (showEbook)
      $('#dcpl_title:eq(0)').after(" <div id = 'category'> E-books </div> <div id = 'ebook' class='digital'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div>");

    if (showBook)
      $('#dcpl_title:eq(0)').after(" <div id = 'category'> Books </div> <div id = 'book'> Searching catalog <img src = '" + chrome.extension.getURL('assets/ajax-loader.gif') + "'> </div> ");

    if ((showAudio === false && showEbook === false && showBook === false) || (showAudio === undefined && showEbook === undefined && showBook === undefined)) {
      $('#dcpl_title:eq(0)').after(" <div id = 'book'> <a href = 'chrome-extension://plbkclaloadjhljkijjnlingopbahndg/options.html' target='_blank'> Click here to set your search preferences </a> ");
  }

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

  var guide;

//////////////////////
/* SEARCH FUNCTIONS */
//////////////////////

  // Establish search URLs, other instructions, based on item being looked at
  function searchGuide(author, title, isbn) {
    console.log("Initialize: Establishing URLs");

    var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";

    guide = {
      "book": {
        "search": {
          "isbn": base + isbn + "&te=&lm=BOOKS", 
          "text1": base + encodeURIComponent(title + " " + author).replace(/'/g, "%27") + "&qu=-%22sound+recording%22&te=&lm=BOOKS",
          "text2": base + encodeURIComponent(overdriveTitle(title) + " " + author).replace(/'/g, "%27") + "&qu=-%22sound+recording%22&te=&lm=BOOKS"
        },
        "fail": "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X",
        "modify": "div#book",
        "name": "Book"
      },
      "ebook": {
        "search": ["http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria=" + encodeURIComponent(overdriveTitle(title) + " " + overdriveAuthor(author)) + "&x=0&y=0&Format=420%2C50%2C410%2C450%2C610%2C810%2C303"],
        "fail": "http://overdrive.dclibrary.org",
        "modify": "div#ebook",
        "name": "E-book"
      },
      "audiobook": {
        "search": ["http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria=" + encodeURIComponent(overdriveTitle(title) + " " + overdriveAuthor(author)) + "&x=0&y=0&Format=425"],
        "fail": "http://overdrive.dclibrary.org",
        "modify": "div#audio",
        "name": "Audiobook"
      }
    }
  }

  // Depending on user settings, search for book, e-book, and/or audiobook in catalogs
  function initiateSearch(page_info, showAudio, showEbook, showBook) {
    if (showBook) {
      if (page_info['isbn'] === null | page_info['isbn'] === "") {
        console.log("Book: Searching catalog by title and author")
        searchSirsi("text1", page_info);
      } else {
        console.log("Book: Searching catalog by ISBN")
        searchSirsi("isbn", page_info);
      }
    }

    if (showEbook)
      searchOverdrive("ebook");

    if (showAudio)
      searchOverdrive("audiobook");
  }

  // search the sirsi catalog
  function searchSirsi(search_by, info) {
    $.get(guide.book.search[search_by], function(data) {
      result = $(data).text().replace(/\n/g, "");
      sirsiAvailability(result, search_by, info);
    });
  }

  // search overdrive using a background page. for some reason get requests do not work otherwise. mystery.
  function searchOverdrive(type) {
    console.log(type + ": Searching Overdrive");
    chrome.runtime.sendMessage({
        method: 'GET',
        action: 'xhttp',
        url: guide[type].search[0]
      },
      function(response) {
        var result = $(response);
        overdriveAvailability(result, type);
    });
  }

  // parse returned sirsi page. uses regex.
  function sirsiAvailability(result, search_by, info) {
    try {
      var availability = JSON.parse(result.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/, "$1"));

      var availabilityData = {
        "available": parseInt(availability['totalAvailable'].toString()),
        "total": parseInt(availability['copies'][0].match(/(\d+)$/)[1]),
        "wait": parseInt(availability['holdCounts'][0].match(/(\d+)$/)[1])   
      };

      successMessage(availabilityData, "book", guide.book.search[search_by]);

      console.log("Book: Located in catalog");
    } catch (e) {
      if (search_by === "isbn") {
        console.log("Book: Search by ISBN failed\nBook: Searching catalog by title and author");
        searchSirsi("text1", info);
      } else if (search_by === "text1" && info['title'].match(/:/) !== null) {
        console.log("Book: Searching catalog without subtitle");
        searchSirsi("text2", info);
      } else if (result.match("This search returned no results.") !== null) {
        console.log("Book: Not located in catalog");
        failureMessage("book", "not_located", guide.book.search[search_by]);
      } else {
        console.log("Book: Uncertain match in catalog");
        failureMessage("book", "uncertain", guide.book.search[search_by]);
      }
    }
  }

  // parse returned overdrive page
  function overdriveAvailability(result, type) {
    try {
      var availability = result.find('.img-and-info-contain:eq(0)');

      var availabilityData = {
        "available": parseInt(availability.attr("data-copiesavail")),
        "total": parseInt(availability.attr("data-copiestotal")),
        "wait": parseInt(availability.attr("data-numwaiting"))  
      };

      var view = result.find('.li-details a:eq(0)');
      var itemURL = "http://overdrive.dclibrary.org/10/50/en/" + view.attr("href");

      successMessage(availabilityData, type, itemURL);
      console.log(type + ": Located in Overdrive");
    } catch (e) {
      console.log(type + ": Not located in Overdrive");
      failureMessage(type, "not_located", guide[type].fail);
    }
  }

/////////////////////
/* OUTCOME DISPLAY */
/////////////////////

  // display success message in results div
  function successMessage(availabilityData, type, itemURL) {
    var total_statement = (availabilityData.total === 1) ? availabilityData.total + " copy" : availabilityData.total + " copies";
    var wait_statement = (availabilityData.wait === 1) ? availabilityData.wait + " patron waiting" : availabilityData.wait + " patrons waiting";
    var available_statement = availabilityData.available + " available";
    var parenthetical_statement = (availabilityData.wait > 0 && availabilityData.available === 0) ? wait_statement : available_statement;

    $(guide[type].modify).html("<a id='results' href = '" + itemURL + "'>" + guide[type].name + " located </a> <br>" + total_statement + " (" + parenthetical_statement + ")");

  }

  // display failure message in results div
  function failureMessage(type, failure_type, failure_url) {
    if (type === "book") {
      if (failure_type === "not_located") {
        $(guide[type].modify).html(guide[type].name + " not located <br> <a id='results' href = '" + failure_url + "'>Search manually</a> <br> <a id='results' href = '" + guide.book.fail + "'>Request purchase</a>");
      } else {
        $(guide[type].modify).html("Possible match located <br> <a id='results' href = '" + failure_url + "'>Search manually</a> <br> <a id='results' href = '" + guide.book.fail + "'>Request purchase</a>");
      }
    } else {
      $(guide[type].modify).html(guide[type].name + " not located <br> <a id='results' href = '" + failure_url + "'>Search manually</a>");
    }
  }