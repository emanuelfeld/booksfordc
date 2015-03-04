if (/amazon\.com$/.test(document.domain)) {

	var isBook = false;
	var isEBook = false;
	var isbn = "";

	//locate book/ebook and title and, if book, ISBN13

	if ($('#btAsinTitle').length){

		var title = $('#btAsinTitle').text().replace(/\(.*\)/g,"").replace(/\[.*\]/,""),
			author = $('.contributorNameTrigger').text();
		isEBook = true;
		console.log(0);

	} else if ($('#productTitle').length) {
		console.log(1);
		var title = $('#productTitle').text().replace(/\(.*\)/g,"").replace(),
			author = $('.a-link-normal.contributorNameID:first').text(),
			isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text(),
			isbn = isbn13.split(':')[1].replace(/\D/g,'');
		isBook = true;

	} 

	console.log(3);
	//URLs


	if (isEBook == true| isBook == true){
	
		//Base for library catalog search
		var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
		//URL for ISBN search
		var isbnURL = base + isbn;
		//URL to search catalog by title and author for books
		var taURL = base+encodeURIComponent(title+" "+author).replace(/'/g, "%27")+"&qf=FORMAT%09Bibliographic+Format%09BOOK%09Book";
		//"&te=&lm=BOOKS";
		//URL to search catalog for ebooks
		var ebookURL = base+"TITLE%3D"+encodeURIComponent(title+" ").replace(/'/g, "%27")+"&qu=AUTHOR%3D"+encodeURIComponent(author).replace(/'/g, "%27")+"&qf=FORMAT%09Bibliographic+Format%09E_BOOK%09eBook";
		//URL to request library purchase
		var purchaseURL = "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X";

		console.log(4);
		if (isEBook == true){
			console.log(5);
			if ($('div.kicsBoxContents').length){
				console.log(6);
		        var container = $('div.kicsBoxContents');    
			    container.before("<div id='dcpl_digital'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div>  <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div> </div>");
		    	var modify_digital = $("div#digital");
			    var modify_book = $("div#book");
		
			    searchCatalog(modify_book,modify_digital,taURL,taURL,ebookURL,purchaseURL,isBook,isEBook);

		    } 	

		} else {
			console.log(7);
			if ($('div.a-box.rbbSection.selected.dp-accordion-active').length){
				console.log(8);
		        var container = $('div.a-box.rbbSection.selected.dp-accordion-active');    
			    container.prepend("<div id='dcpl' class='a-box'><span id='dcpl_title'>DCPL Search</span> <br> <span id='category'>Library Catalog</span> <br> <span id='book'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </span>  <br> <strong>Digital Catalog</strong> <br> <span id='digital'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </span> </div>");
		    	var modify_digital = $("span#digital");
			    var modify_book = $("span#book");

				searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL,isBook,isEBook);

			} else if($('div#unqualifiedBuyBox').length){
				console.log(9);    
		        var container = $('div#unqualifiedBuyBox');
			    container.prepend("<div id='dcpl' class='a-box'><span id='dcpl_title'>DCPL Search</span> <br> <span id='category'>Library Catalog</span> <br> <span id='book'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </span>  <br> <strong>Digital Catalog</strong> <br> <span id='digital'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </span> </div>");
		    	var modify_digital = $("span#digital");
			    var modify_book = $("span#book");
	
				searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL,isBook,isEBook);

		    }
		}		
	}

	function searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL,isBook,isEBook) {
	     	$.get(isbnURL,
		        function(data){
		            var oneline = $(data).text().replace(/\n/g,"");
		            try {
			      			var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/,"$1"));
			            	var available = availabilityJSON['totalAvailable'].toString();
			            	var total = availabilityJSON['copies'][0].match(/(\d+)$/)[1];
			            	if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
			                	modify_book.html("Book located <br> <a id='results' href = '" + isbnURL + "'>"+total+" Copy ("+available+" Available)</a>");
			            	} else {
			                	modify_book.html("Book located <br> <a id='results' href = '" + isbnURL + "'>"+total+" Copies ("+available+" Available)</a>");
			            	}
		            	} catch (e) {
			            	if (isEBook==true){
			            		if (oneline.match("This search returned no results.")!=null){
			                		modify_book.html("Book not located <br> <a id='results' href = '" + taURL + "'>Search manually</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");	            	
			            		} else {
			               			 modify_book.html("Multiple possible matches <br> <a id='results' href = '" + taURL + "'>View results</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");
			            		}	            	
			            	} else {
				            	taSearch(modify_book,taURL,purchaseURL);	            				            		
			            	}
		            	}
		        }
		    );

			$.get(ebookURL,
		        function(data){
		            var oneline = $(data).text().replace(/\n/g,""),
		            	overdrive_id = oneline.replace(/.*fOVERDRIVE\:(.+?)\$.*/,"$1"),
		            	overdriveURL = "http://overdrive.dclibrary.org/ContentDetails.htm?id="+overdrive_id;
		            if(overdrive_id.length>100){
	                	modify_digital.html("E-book not located <br> <a id='results' href = 'http://overdrive.dclibrary.org/'>Search manually</a>");            		
		            } else {
			            overdriveSearch(modify_digital,overdriveURL,purchaseURL);		            	
		            }
		        }
		    );   
	}

	function taSearch(modify_book,taURL,purchaseURL){
			//load and format data from catalog search
	     	$.get(taURL,
	        function(data){
	            var oneline = $(data).text().replace(/\n/g,"");
	            try {
		      			var book_json = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/,"$1"));
		            	var available = book_json['totalAvailable'].toString();
		            	var total = book_json['copies'][0].match(/(\d+)$/)[1];
		            	if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
		                	modify_book.html("Book located <br> <a id='results' href = '" + taURL + "'>"+total+" Copy ("+available+" Available)</a>");
		            	} else {
		                	modify_book.html("Book located <br> <a id='results' href = '" + taURL + "'>"+total+" Copies ("+available+" Available)</a>");
		            	}
	            	} catch (e) {
						if (oneline.match("This search returned no results.")!=null){
			                modify_book.html("Book not located <br> <a id='results' href = '" + taURL + "'>Search manually</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");	            	
			            } else {
			                modify_book.html("Multiple possible matches <br> <a id='results' href = '" + taURL + "'>View results</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");
			            }	            	
			        }
	        }
	    );   
	}

	function overdriveSearch(modify_digital,overdriveURL,purchaseURL){
		console.log(modify_digital);
		console.log(overdriveURL);
		$.get(overdriveURL,
			function(data){
				var oneline = $(data).text().replace(/\n/g,"");
	            var available = oneline.replace(/.*Available:(\d+).*/,"$1");
	            var total = oneline.replace(/.*Library copies:(\d+).*/,"$1");
            	if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
                	modify_digital.html("E-book located <br> <a id='results' href = '" + overdriveURL + "'>"+total+" Copy ("+available+" Available)</a>");
            	} else if(available.match(/^[0-9]+$/)!=null && total.match(/^[0-9]+$/)!=null) {
                	modify_digital.html("E-book located <br> <a id='results' href = '" + overdriveURL + "'>"+total+" Copies ("+available+" Available)</a>");
            	} else {
                	modify_digital.html("E-book not located <br> <a id='results' href = 'http://overdrive.dclibrary.org/'>Search manually</a>");            		
            	}
			});
	}
}


