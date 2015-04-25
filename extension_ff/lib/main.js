var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var gifurl = [data.url("ajax-loader.gif"), data.url("icon16white.png")];
var preferences = require("sdk/simple-prefs").prefs;
var details = { "imageurl": gifurl, "prefs": preferences }

pageMod.PageMod({
  include: "*.amazon.com",
  contentScriptFile: ["./jquery-2.1.3.min.js","./booksfordc.js","./amazon.js"],
  contentStyleFile: "./booksfordc.css",
  contentScriptWhen: "ready",
  onAttach: function(worker) {
  	worker.port.emit("details", details);
  }
});

pageMod.PageMod({
  include: /.*goodreads\.com\/book\/show\/.*/,
  contentScriptFile: ["./jquery-2.1.3.min.js","./booksfordc.js","./goodreads.js"],
  contentStyleFile: "./booksfordc.css",
  contentScriptWhen: "ready",
  onAttach: function(worker) {
    worker.port.emit("details", details);
  }
});

pageMod.PageMod({
  include: /.*barnesandnoble\.com\/w\/.*/,
  contentScriptFile: ["./jquery-2.1.3.min.js","./booksfordc.js","./bn.js"],
  contentStyleFile: "./booksfordc.css",
  contentScriptWhen: "ready",
  onAttach: function(worker) {
    worker.port.emit("details", details);
  }
});
