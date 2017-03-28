// Saves options to chrome.storage.sync.
function save_options () {
  chrome.storage.sync.set({
    'book': document.getElementById('bookCheck').checked,
    'ebook': document.getElementById('ebookCheck').checked,
    'audiobook': document.getElementById('audiobookCheck').checked,
    'openTabs': document.getElementById('openTabs').value == 'true'
  }, function () {
        // Update status to let user know options were saved.
    var status = document.getElementById('status')
    status.textContent = 'options saved. happy reading!'
    setTimeout(function () {
      status.textContent = ''
    }, 750)
  })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options () {
  chrome.storage.sync.get({
    'book': false,
    'ebook': false,
    'audiobook': false,
    'openTabs': 'false'
  }, function (items) {
    document.getElementById('bookCheck').checked = items.book
    document.getElementById('ebookCheck').checked = items.ebook
    document.getElementById('audiobookCheck').checked = items.audiobook
    document.getElementById('openTabs').value = items.openTabs
  })
}

document.addEventListener('DOMContentLoaded', restore_options)
document.getElementById('save').addEventListener('click', save_options)
