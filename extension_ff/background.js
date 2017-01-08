function handleOptionsClick() {
    console.log('handling click');
    var opening = browser.runtime.openOptionsPage();
    opening.then(onOpened, onError);
}


function onOpened() {
  console.log('options: page opened');
}

function onError(error) {
  console.log('error: options page not opened');
}


browser.browserAction.onClicked.addListener(handleOptionsClick);

browser.runtime.onMessage.addListener(handleOptionsClick);