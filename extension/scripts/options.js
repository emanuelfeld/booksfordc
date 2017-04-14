(function () {
  'use strict'

  var optionsHandler = function (fn) {
      let browserStorage
      
      if (!!window.chrome) {
        window.browser = window.chrome
      } else {
        window.browser = browser
      }

      window.browser.storage.sync.get(['testSync'], function (res) { 
        try {
          let syncEnabled = res.testSync
          browserStorage = window.browser.storage.sync
          console.log(`OPTIONS: using storage sync`)
        } catch (e) {
          browserStorage = window.browser.storage.local
          console.log(`OPTIONS: using storage local`)
        }
        fn(browserStorage)
      })
  }

  var saveOptions = function (browserStorage) {
    browserStorage.set({
      'book': document.getElementById('bookCheck').checked,
      'ebook': document.getElementById('ebookCheck').checked,
      'audiobook': document.getElementById('audiobookCheck').checked,
      'openTabs': document.getElementById('openTabs').value == 'true'
    }, function () {
      let status = document.getElementById('status')
      status.textContent = 'options saved. happy reading!'
      setTimeout(function () {
        status.textContent = ''
      }, 750)
    })
  }

  var restoreOptions = function (browserStorage) {
    browserStorage.get({
      'book': false,
      'ebook': false,
      'audiobook': false,
      'openTabs': 'false'
    }, function (settings) {
      document.getElementById('bookCheck').checked = settings.book
      document.getElementById('ebookCheck').checked = settings.ebook
      document.getElementById('audiobookCheck').checked = settings.audiobook
      document.getElementById('openTabs').value = settings.openTabs
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    optionsHandler(restoreOptions)
  })

  document.getElementById('save').addEventListener('click', function () {
    optionsHandler(saveOptions)
  })
})()
