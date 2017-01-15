function onOptionsSet() {}

function onOptionsError(error) {}

function handleOptionsClick() {
    var opening = browser.runtime.openOptionsPage();
    opening.then(onOptionsSet, onOptionsError);
}

browser.browserAction.onClicked.addListener(handleOptionsClick);

browser.runtime.onMessage.addListener(handleOptionsClick);

function handleInstall(details) {
    var details = {'reason': 'update'};
    var version = browser.runtime.getManifest().version;
    if (details.reason === 'install') {
        browser.tabs.create({
            "url": "http://booksfordc.org/welcome-firefox?source=firefox&" + "version=" + version
          });
    }
}

// browser.runtime.onInstalled.addListener(handleInstall);

function onUninstallURL() {
  console.log("set uninstall URL");
}
 
function onUninstallError(error) {
  console.log(`Error: ${error}`);
}

var settingUrl = browser.runtime.setUninstallURL('http://bit.ly/bfdc-firefox');
settingUrl.then(onUninstallURL, onUninstallError);
