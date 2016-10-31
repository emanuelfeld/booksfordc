// Saves options to chrome.storage.sync.
function save_options() {
  console.log("saving");
  var bookMedia = document.getElementById('bookCheck').checked;
  var ebookMedia = document.getElementById('ebookCheck').checked;
  var audioMedia = document.getElementById('audioCheck').checked;
  var openTabs = document.getElementById('openTabs').value == "true";
  chrome.storage.sync.set({
    'bookMedia': bookMedia, 
    'ebookMedia': ebookMedia, 
    'audioMedia': audioMedia,
    'openTabs': openTabs
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  console.log("restoring");
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    'bookMedia': true, 
    'ebookMedia': true, 
    'audioMedia': true,
    'openTabs': "false"
  }, function(items) {
    document.getElementById('bookCheck').checked = items.bookMedia;
    console.log(items.bookMedia);
    document.getElementById('ebookCheck').checked = items.ebookMedia;
    console.log(items.ebookMedia);
    document.getElementById('audioCheck').checked = items.audioMedia;
    console.log(items.audioMedia);
    document.getElementById('openTabs').value = items.openTabs;
    console.log(items.openTabs);
  });
}

console.log = function() {}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
