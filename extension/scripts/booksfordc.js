if (/amazon\.com$/.test(document.domain)) {
	//locate ISBN13
	var isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
	var isbn = isbn13.split(':')[1].replace(/\D/g,'');

	//format search URL for DCPL
	var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
	var bookURL = base + isbn;

	//URL to request library purchase
	var purchaseURL = "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X";

	//assign title and author for ebook search, and if isbn search fails for physical book
	var title_regex = /\(.*\)/g
	var altURL_regex = /'/g
	var newline_regex = /\n/g
	var title = $('#productTitle').text().replace(title_regex,"").replace();
	var author = $('.a-link-normal.contributorNameID:first').text();
	var altURL = base+encodeURIComponent(title+" "+author).replace(altURL_regex, "%27")+"&te=&lm=BOOKS";
	//var ebookURL = base+encodeURIComponent(title+" "+author).replace(/'/g, "%27")+"&te=&lm=E-BOOK";

	if(isbn.length==13){

	    //determine where to prepend booksfordc div
		if ($('div.a-box.rbbSection.selected.dp-accordion-active').length){
	        var container = $('div.a-box.rbbSection.selected.dp-accordion-active');    
	    } else if($('div#unqualifiedBuyBox').length){
	        var container = $('div#unqualifiedBuyBox');
	    }
	    
	    container.prepend("<div id='dcpl' class='a-box'><span id='dcpl_title'>DCPL Search</span> <br> Searching catalog by ISBN <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'></div>");
	    
	    var modify = $("div#dcpl");
	    
	    doSearch(modify,bookURL,altURL,purchaseURL);
	}

	function doSearch(where,url,alt,purchase){
			//load and format data from catalog search
	     	$.get(url,
	        function(data){
	        	var dcpl = $(data);
	        	console.log(0);
	            var oneline = dcpl.text().replace(newline_regex,"");
	            try {
		      			var book_json = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/,"$1"));
		            	var available = book_json['totalAvailable'].toString();
		            	var total = book_json['copies'][0].match(/(\d+)$/)[1];
		            	if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
		                	where.html("<span id='dcpl_title'>DCPL Search</span> <br> Located in catalog <br> <a href = '" + url + "'>"+total+" Copy ("+available+" Available)</a>");
		            	} else {
		                	where.html("<span id='dcpl_title'>DCPL Search</span> <br> Located in catalog <br> <a href = '" + url + "'>"+total+" Copies ("+available+" Available)</a>");
		            	}
	            	} catch (e) {
	            		console.log("BAD");
		            	where.html("<span id='dcpl_title'>DCPL Search</span> <br> Searching catalog by title and author <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'>")
		            	altSearch(where,alt,purchase);	            	
	            	}
	        }
	    );   
	}

	function altSearch(where,url,purchase){
			//load and format data from catalog search
	     	$.get(url,
	        function(data){
	        	var dcpl = $(data);
	        	console.log(0);
	            var oneline = dcpl.text().replace(newline_regex,"");
	            try {
		      			var book_json = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/,"$1"));
		            	var available = book_json['totalAvailable'].toString();
		            	var total = book_json['copies'][0].match(/(\d+)$/)[1];
		            	if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
		                	where.html("<span id='dcpl_title'>DCPL Search</span> <br> Located in catalog <br> <a href = '" + url + "'>"+total+" Copy ("+available+" Available)</a>");
		            	} else {
		                	where.html("<span id='dcpl_title'>DCPL Search</span> <br> Located in catalog <br> <a href = '" + url + "'>"+total+" Copies ("+available+" Available)</a>");
		            	}
	            	} catch (e) {
						if (oneline.match("This search returned no results.")!=null){
			                where.html("<span id='dcpl_title'>DCPL Search</span> <br> No results found <br> <a href = '" + url + "'>Search manually</a> <br> <a href = '" + purchase + "'>Request Purchase</a>");	            	
			            } else {
			                where.html("<span id='dcpl_title'>DCPL Search</span> <br> Multiple possible matches <br> <a href = '" + url + "'>View results</a> <br> <a href = '" + purchase + "'>Request Purchase</a>");
			            }	            	
			        }
	        }
	    );   
	}

}