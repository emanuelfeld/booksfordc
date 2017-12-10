(function () {
  'use strict'
  
  // Check browser type 
  if (!!window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  console.log(`SETUP: using {{browserType}}`)

  // Determine if storage.sync is enabled and then run
  window.browser.storage.sync.get(['testSync'], function (res) {
    let browserStorage

    try {
      let syncEnabled = res.testSync
      browserStorage = window.browser.storage.sync
      console.log(`SETUP: using storage sync`)
    } catch (e) {
      browserStorage = window.browser.storage.local
      console.log(`SETUP: using storage local`)
    }

    run(browserStorage)
  })

  var run = function (browserStorage) {
    browserStorage.get(['book', 'ebook', 'audiobook', 'openTabs'], function (settings) {
      let extension = new Extension(settings)
      extension.validatePage()

      if (extension.page.onBookPage) {
        extension.page.initializeLayout()
        extension.listenForOptionsClick()
        if (extension.mediaTypes.length) {
          let request = extension.page.getDetails()
          extension.run(request)        
        }
      }
    })    
  }

  var Extension = function (settings) {
    this.settings = settings
    this.useTabs = settings['openTabs']
    this.mediaTypes = ['audiobook', 'ebook', 'book'].filter(function (elem) {
      return settings[elem] === true
    })
  }

  Extension.prototype = {
    // Open Books for DC options page
    listenForOptionsClick: function () {
      $('.bfdc-options').click(function () {
        window.browser.runtime.sendMessage({'options': true})
      })
    },

    // Start catalog searches
    run: function (request) {
      if (this.settings['book']) {
        let book = new SirsiCatalog(this, request)
        book.search(this)
        console.log(`RUNNING: book search`)
      }
      if (this.settings['ebook']) {
        let ebook = new OverdriveCatalog(this, request, 'ebook')
        ebook.search(this)
        console.log(`RUNNING: ebook search`)
      }
      if (this.settings['audiobook']) {
        let audiobook = new OverdriveCatalog(this, request, 'audiobook')
        audiobook.search(this)
        console.log(`RUNNING: audiobook search`)
      }
    },

    // Determine site, container for plugin display, and whether on book page
    validatePage: function () {
      if (/goodreads\.com$/.test(document.domain)) {
        this.site = 'goodreads'
        this.page = new GoodreadsPage(this)
      } else if (/barnesandnoble\.com$/.test(document.domain)) {
        this.site = 'bn'
        this.page = new BNPage(this)
      } else if (/amazon\.com$/.test(document.domain)) {
        this.site = 'amazon'
        this.page = new AmazonBookPage(this)
      }
      console.log(`SETUP: site: ${this.site}; valid book page: ${this.page.onBookPage}`)
    }
  }

  /* CATALOG SEARCHERS & PARSERS */

  var Catalog = function () {
    this.status = 'not found'
    this.copies = 0
    this.available = 0
  }

  Catalog.prototype = {
    // Check search URLs (ISBN, title/author) until match found or no more URLs
    search: function () {
      let self = this
      let url = self.searchUrls.shift()

      if (url) {
        $.get(url, function (data) {
          self.url = url
          if (self.parseAvailability(data)) {
            self.page.updateLayout(self.extension, self)
            return true
          } else {
            self.search()
          }
        })
      } else {
        self.page.updateLayout(self.extension, self)
        return false
      }
    },

    toJSON: function () {
      return {
        mediaType: this.mediaType,
        status: this.status,
        copies: this.copies,
        available: this.available,
        url: this.url
      }
    }
  }

  // SirsiDynix Catalog subclass

  var SirsiCatalog = function (extension, request) {
    this.extension = extension
    this.page = extension.page
    this.mediaType = 'book'
    this.baseUrl = 'https://catalog.dclibrary.org/'
    this.searchUrls = [
      this.baseUrl + 'client/en_US/dcpl/search/results?ln=en_US&rt=&qu=' + request.isbn + '&te=&lm=BOOKS',
      this.baseUrl + 'client/en_US/dcpl/search/results?ln=en_US&rt=&qu=' + encodeURIComponent(request.title + ' ' + request.author).replace(/'/g, '%27') + '&qu=-%22sound+recording%22&te=&lm=BOOKS'
    ]
  }

  SirsiCatalog.prototype = new Catalog()

  SirsiCatalog.prototype.parseAvailability = function (data) {
    let parser = new window.DOMParser()
    data = parser.parseFromString(data, 'text/html')

    let scripts = data.scripts
    let availabilityData

    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].textContent.indexOf('parseDetailAvailabilityJSON') > -1) {
        let results = data.scripts[i].textContent
        availabilityData = JSON.parse(results.split('parseDetailAvailabilityJSON(')[1].split(')')[0])
        break
      }
    }

    if (availabilityData) {
      this.copies = parseInt(availabilityData.copies[0].match(/(\d+)$/)[1], 10)
      this.available = parseInt(availabilityData.totalAvailable.toString(), 10)
      this.status = 'found'
      return true
    } else if (data.getElementById('no_results_wrapper')) {
      return false
    } else {
      this.status = 'uncertain'
      return false
    }
  }

  // Overdrive Catalog subclass

  var OverdriveCatalog = function (extension, request, mediaType) {
    this.extension = extension
    this.page = extension.page
    this.mediaType = mediaType
    this.baseUrl = 'https://dclibrary.overdrive.com/'
    this.searchUrls = [
      this.baseUrl + 'search/title?query=' + encodeURIComponent(request.title) + '&creator=' + encodeURIComponent(request.author) + '&sortBy=relevance&mediaType=' + mediaType
    ]
  }

  OverdriveCatalog.prototype = new Catalog()

  OverdriveCatalog.prototype.parseAvailability = function (data) {
    let parser = new window.DOMParser()
    data = parser.parseFromString(data, 'text/html')

    let scripts = data.scripts
    let availabilityData

    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].textContent.indexOf('titleCollection') > 0) {
        let results = scripts[i].textContent
        availabilityData = JSON.parse(results.split(/titleCollection *= */)[1].split(';\n')[0])[0]
        break
      }
    }

    if (availabilityData) {
      this.url = this.baseUrl + 'media/' + availabilityData.id
      this.copies = parseInt(availabilityData.ownedCopies, 10)
      this.available = parseInt(availabilityData.availableCopies, 10)
      this.status = 'found'
      return true
    } else {
      this.url = this.baseUrl
      return false
    }
  }

  /* PAGE PARSERS & MODIFIERS */

  var Page = function () {
    this.onBookPage = false
  }

  Page.prototype = {
    // Return book's information
    getDetails: function () {
      let request = {
        title: cleanTitle(this.getTitle()),
        author: cleanAuthor(this.getAuthor()),
        isbn: this.getISBN()
      }
      console.log(`SETUP: searching for ${JSON.stringify(request)}`)
      return request
    },

    // Inject the plugin's initial content into the book page
    initializeLayout: function () {
      let iconURL = window.browser.extension.getURL('assets/icon16white.png')
      let pluginBox = `<div id='bfdc-${this.extension.site}' class='bfdc-container'>
                         <div class='bfdc-icon'>
                           <a class='bfdc-options'>
                              <img class='bfdc-icon-img' src = '${iconURL}'>
                           </a>
                         </div>
                         <div class='bfdc-availability'>
                            <div class='bfdc-title'>
                                <a href = 'https://booksfordc.org?utm_source={{browserType}}&utm_campaign=${this.extension.site}' target='_blank'>
                                  booksfordc
                                </a>
                            </div>
                         </div>
                       </div>`

      this.container.prepend(pluginBox)
      console.log(`SETUP: added plugin skeleton`)

      // Require that the user check at least one media type
      if (this.extension.mediaTypes.length) {
        let loaderGifUrl = window.browser.extension.getURL('assets/ajax-loader.gif')

        // Insert a placeholder div for each media type
        this.extension.mediaTypes.forEach(function (mediaType) {
          let mediaTypeDiv = `<div class='bfdc-media-title bfdc-media'>
                                ${mediaType}s
                              </div>
                              <div id='bfdc-${mediaType}' class='bfdc-media bfdc-media-status'>
                                searching <img src = '${loaderGifUrl}'>
                              </div>`

          $('.bfdc-title:eq(0)').after(mediaTypeDiv)
          console.log(`SETUP: added ${mediaType} div`)
        })

        // Insert footer to bottom of plugin box
        $('div.bfdc-media:last-child').after(
            `<div class='bfdc-media bfdc-footer'>
              <a href='https://catalog.dclibrary.org/client/en_US/dcpl/search/patronlogin/https:$002f$002fcatalog.dclibrary.org$002fclient$002fen_US$002fdcpl$002frequests$003f' target='_blank'>
                ask the dcpl to buy a book
              </a>
            </div>
            <div class='bfdc-media bfdc-footer'>
              <a class='bfdc-options'>
                options
              </a>
            </div>
            <div class='bfdc-media bfdc-footer'>
              <a href='https://booksfordc.herokuapp.com/contribute?utm_source={{browserType}}&utm_campaign=${this.extension.site}' target='_blank'>
                donate
              </a>
            </div>`
        )
      } else {
        $('.bfdc-title:eq(0)').after(
          `<div class='bfdc-media'>
            <a class='bfdc-options'>
              click here to set your search preferences
            </a>
          </div>`
        )
      }
      console.log(`SETUP: initialized layout for media settings ${JSON.stringify(this.extension.mediaTypes)}`)
    },

    // Update content
    updateLayout: function (extension, catalog) {
      let content
      let target = extension.useTabs ? '_blank' : '_self'
      let url = catalog.url

      if (catalog.copies > 0) {
        content = `<a class='bfdc-media bfdc-media-results' target='${target}' href='${url}'>
                    ${catalog.copies} ${catalog.copies === 1 ? 'copy' : 'copies'} (${catalog.available} available)
                  </a>`
      } else {
        let urlText
        if (catalog.status === 'not found') {
          urlText = 'search manually'
        } else {
          urlText = 'view results'
        }
        content = `${catalog.status} <br> 
                  <a class='bfdc-media bfdc-media-results' target='${target}' href = '${url}'>
                    ${urlText}
                  </a>`
      }

      $('div#bfdc-' + catalog.mediaType).html(content)
      console.log(`SUCCESS: ${JSON.stringify(catalog)}`)
    }
  }

  // Goodreads Page subclass

  var GoodreadsPage = function (extension) {
    if ($('div.rightContainer').length) {
      this.extension = extension
      this.container = $('div.rightContainer:first')
      this.onBookPage = true
    }
  }

  GoodreadsPage.prototype = new Page()

  GoodreadsPage.prototype.getTitle = function () {
    return document.getElementById('bookTitle').textContent
  }

  GoodreadsPage.prototype.getAuthor = function () {
    return document.getElementsByClassName('authorName')[0].textContent
  }

  GoodreadsPage.prototype.getISBN = function () {
    let isbn10
    let isbn13
    let bookDetails = document.getElementById('bookDataBox').textContent

    try {
      isbn13 = bookDetails.split('ISBN13:')[1].trim().substr(0, 13)
      return isbn13
    } catch (e) {
      console.log(`SETUP: ISBN-13 not found`)
    }

    try {
      isbn10 = bookDetails.split('ISBN')[1].trim().substr(0, 10)
      isbn13 = convertISBN(isbn10)
      return isbn13
    } catch (e) {
      console.log(`SETUP: ISBN-10 not found`)
    }

    return ''
  }

  // Amazon Page subclass

  var AmazonBookPage = function (extension) {
    if (!$('#nav-subnav').length || !$('#nav-subnav').attr('data-category')) {
      return false
    }

    let amazonMediaCategory = $('#nav-subnav').attr('data-category').toLowerCase()
    let isBookPage = ['books', 'book', 'digital-text', 'digital-texts'].indexOf(amazonMediaCategory) > -1

    if (!isBookPage) {
      return false
    }

    this.extension = extension

    if ($('div#mediaTabsGroup').length) {
      this.container = $('#mediaTab_content_landing')
      this.extension.site = 'amazon-new'
      this.onBookPage = true
    } else if ($('#combinedBuyBox').length) {
      this.container = $('#combinedBuyBox')
      this.onBookPage = true
    } else if ($('#audiblebuybox_feature_div').length) {
      this.container = $('#audiblebuybox_feature_div')
      this.onBookPage = true
    }
  }

  AmazonBookPage.prototype = new Page()

  AmazonBookPage.prototype.getTitle = function () {
    let title = $('#productTitle').text() ||
                $('#ebookProductTitle').text() ||
                $('#btAsinTitle').text() || ''

    return title
  }

  AmazonBookPage.prototype.getAuthor = function () {
    let author = $('.contributorNameID:first').text() ||
                 $('.author:first').text() || ''

    return author
  }

  AmazonBookPage.prototype.getISBN = function () {
    let isbn13
    let isbn10
    let bookDetails = $('#productDetailsTable').text() ||
                      $('#hardcover_meta_binding_winner').find('.bucketBorderTop').attr('id') ||
                      $('#aboutEbooksSection span').attr('data-a-popover') || ''

    try {
      isbn13 = bookDetails.split('ISBN-13')[1]
                              .match(/[0-9X-]+/)[0]
                              .replace('-', '')
                              .trim()
                              .substr(0, 13)
      return isbn13
    } catch (e) {
      console.log(`SETUP: ISBN-13 not found`)
    }

    try {
      isbn10 = bookDetails.split('ISBN-10')[1]
                              .match(/[0-9X-]+/)[0]
                              .replace('-', '')
                              .trim()
                              .substr(0, 10)
      isbn13 = convertISBN(isbn10)
      return isbn13
    } catch (e) {
      console.log(`SETUP: ISBN-10 not found`)
    }

    return ''
  }

  // Barnes and Noble Page subclass

  var BNPage = function (extension) {
    if ($('.format-content').length) {
      this.extension = extension
      this.container = $('.format-content')
      this.onBookPage = true
    }
  }

  BNPage.prototype = new Page()

  BNPage.prototype.getTitle = function () {
    return $('#prodSummary h1').text() || ''
  }

  BNPage.prototype.getAuthor = function () {
    return $('.contributors a:first').text() || ''
  }

  BNPage.prototype.getISBN = function () {
    let isbn13 = $('#ProductDetailsTab dd:first').text() || ''
    let isbn = isbn13.replace(/\D/g, '')
    return isbn
  }

  /* HELPERS */

  // Convert an ISBN-10 value to ISBN-13
  function convertISBN (isbn10) {
    function checkDigit (isbn) {
      let sum = 0

      for (let i = 1; i < isbn.length + 1; i++) {
        if (i % 2 === 0) {
          sum += parseInt(isbn.charAt(i - 1)) * 3
        } else {
          sum += parseInt(isbn.charAt(i - 1))
        }
      }

      let check = (10 - sum % 10) % 10
      return check.toString()
    }

    let isbn = '978' + isbn10.substring(0, isbn10.length - 1)
    return isbn + checkDigit(isbn)
  }

  function cleanTitle (title) {
    return title.replace(/:.*/, '')
                .replace(/\(.*\)/g, '')
                .replace(/\[.*\]/g, '')
                .trim()
  }

  function cleanAuthor (author) {
    return author.replace('Ph.D.', '')
                 .replace(/([A-Z]\.)+/g, '')
                 .replace(/\(.*\)/g, '')
                 .trim()
  }
})()
