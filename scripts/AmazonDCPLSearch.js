// ==UserScript==
// @author     Emanuel Feld
// @name       AmazonDCPLSearch
// @description  Determine availability at DCPL for a book being viewed on Amazon.
// @match      http://*.amazon.com/*
// @require	   http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// ==/UserScript==


$(document).ready(function() {

    var isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
    var isbn = isbn13.split(':')[1].replace(/\D/g,'');
    
    var base = "http://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
    var searchURL = base + isbn;
    
    var container = $('#productTitle');
    if(isbn.length==13){
        doAjax(searchURL,container);
    }

    function doAjax(url,where){
        $.get("https://query.yahooapis.com/v1/public/yql?q=select%20content%20from%20data.headers%20where%20url%3D%22"+
              encodeURIComponent(url)+
              "%22&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
            function(data){
            	var dcpl = $.parseXML(data),
                    $dcpl = $(data),
                    $content = $dcpl.find("content");
                var oneline = $content.text().replace(/\n/g,"")
                var available = oneline.replace(/.*totalAvailable\" : ([0-9]+).*/,"$1");
                var total = oneline.replace(/.*copies\" \: [    "[0-9]+\,([0-9]+).*/,"$1");
                where.append("\n"+total+" copies / "+available+" available");
            }
        );   
    }
});

