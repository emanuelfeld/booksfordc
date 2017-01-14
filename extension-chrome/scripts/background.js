function handleOptionsClick() {
    try {
        chrome.runtime.openOptionsPage(function() {
            LOG('options: open in chrome 42+');
        });
    } catch (e) {
        LOG('options: fallback');
        window.open(chrome.runtime.getURL('options.html'));
    }
}

chrome.runtime.onMessage.addListener(handleOptionsClick);

chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSe5EC11sXP7fjPfkUcbDamddCW7FVPNgDr4VXZJTPzMb-CXKw/viewform');
