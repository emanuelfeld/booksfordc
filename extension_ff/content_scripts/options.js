// Saves options to browser.storage.sync.
function saveOptions(e) {
    console.log("options: saving");
    browser.storage.local.set({
        'book': document.getElementById('bookCheck').checked,
        'ebook': document.getElementById('ebookCheck').checked,
        'audiobook': document.getElementById('audiobookCheck').checked,
        'openTabs': document.getElementById('openTabs').value == "true"
    });
    console.log("options: saved");

    // setting.then((res) => {
    //     var status = document.getElementById('status');
    //     status.textContent = 'Options saved.';
    //     setTimeout(function() {
    //         status.textContent = '';
    //     }, 750);        
    // });
}


// Restores select box and checkbox state using the preferences
// stored in browser.storage.
function restoreOptions() {
    console.log("options: restoring");
    function setCurrentChoice(items) {
        document.getElementById('bookCheck').checked = items.book;
        document.getElementById('ebookCheck').checked = items.ebook;
        document.getElementById('audiobookCheck').checked = items.audiobook;
        document.getElementById('openTabs').value = items.openTabs || "false";
    }

      function onError(error) {
        console.log(`Error: ${error}`);
      }

        var getting = browser.storage.local.get(['book', 'ebook', 'audiobook', 'openTabs']);
        getting.then(setCurrentChoice, onError);

}

console.log('on options page');
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);
