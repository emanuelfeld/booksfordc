(function () {
  'use strict'
  
  if (!!window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  var handleOptionsClick = function () {
    try {
      window.browser.runtime.openOptionsPage()
    } catch (e) {
      window.open(window.browser.runtime.getURL('options.html'))
    }
  }

  window.browser.runtime.onMessage.addListener(handleOptionsClick)

  window.browser.runtime.onInstalled.addListener(function (details) {
    var version = window.browser.runtime.getManifest().version
    if (details.reason === 'install') {
      window.browser.tabs.create({
        'url': `https://booksfordc.org/welcome-{{browserType}}?utm_source={{browserType}}&utm_campaign=install&version=` + version
      })
      window.browser.tabs.create({
        'url': `https://booksfordc.org/update-1-3-6?utm_source={{browserType}}&utm_campaign=update&version=` + version
      })      
    } else if (details.reason === 'update') {
      window.browser.tabs.create({
        'url': `https://booksfordc.org/update-1-3-6?utm_source={{browserType}}&utm_campaign=update&version=` + version
      })      
    }
  })

  window.browser.runtime.setUninstallURL(`http://bit.ly/bfdc-{{browserType}}`)  
})()
