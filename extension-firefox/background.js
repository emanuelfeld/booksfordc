function handleOptionsClick() {
    var opening = browser.runtime.openOptionsPage();
    opening.then(onOpened, onError);
}


function onOpened() {}

function onError(error) {}


browser.browserAction.onClicked.addListener(handleOptionsClick);

browser.runtime.onMessage.addListener(handleOptionsClick);