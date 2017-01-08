
// handle clicks to view options page
// function handleOptionsClick() {
//     if (chrome.runtime.openOptionsPage) {
//         LOG('options: open in chrome 42+');
//         chrome.runtime.openOptionsPage();
//     } else {
//         LOG('options: fallback');
//         window.open(chrome.runtime.getURL('options.html'));        
//     }
// }

function handleOptionsClick() {
    console.log('handling click');
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

// /**
//  * Possible parameters for request:
//  *    action: "xhttp" for a cross-origin HTTP request
//  *    method: Default "GET"
//  *    url     : required, but not validated
//  *    data    : data to send in a POST request
//  *
//  * The callback function is called upon completion of the request */
// chrome.runtime.onMessage.addListener(function(request, sender, callback) {
//     if (request.action == "xhttp") {
//         var xhttp = new XMLHttpRequest();
//         var method = request.method ? request.method.toUpperCase() : 'GET';

//         xhttp.onload = function() {
//                 callback(xhttp.responseText);
//         };
//         xhttp.onerror = function() {
//                 // Do whatever you want on error. Don't forget to invoke the
//                 // callback to clean up the communication port.
//                 callback();
//         };
//         xhttp.open(method, request.url, true);
//         if (method == 'POST') {
//                 xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//         }
//         xhttp.send(request.data);
//         return true; // prevents the callback from being called too early on return
//     }
// });


