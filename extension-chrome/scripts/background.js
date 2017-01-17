function handleOptionsClick() {
    try {
        chrome.runtime.openOptionsPage();
    } catch (e) {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

chrome.runtime.onMessage.addListener(handleOptionsClick);

chrome.runtime.onInstalled.addListener(function (details) {
    var version = chrome.runtime.getManifest().version;
    // var previousVersion = details.previousVersion;
    if (details.reason === 'install') {
        chrome.tabs.create({
            "url": "http://booksfordc.org/welcome-chrome?utm_source=chrome&utm_campaign=install&version=" + version
          });
    }
});

chrome.runtime.setUninstallURL('http://bit.ly/bfdc-chrome');
