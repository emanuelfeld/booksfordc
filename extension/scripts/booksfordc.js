if (/amazon\.com$/.test(document.domain)) {

	var isBook = false;
	var isEBook = false;
	var isbn = "";

	//locate book/ebook and title and, if book, ISBN13

	if ($('#btAsinTitle').length){

		var title = $('#btAsinTitle').text().replace(/\(.*\)/g,"").replace(/\[.*\]/,"");
		if ($('.contributorNameTrigger a:eq(0)').length){
			var author = $('.contributorNameTrigger a:eq(0)').text();			
		} else if ($('.contributorNameTrigger a').length){
			var author = $('.contributorNameTrigger a').text();			
		} else {
			var author = $('div.buying span a').text();			
		}

		isEBook = true;

	} else if ($('#productTitle').length) {

		var title = $('#productTitle').text().replace(/\(.*\)/g,"").replace(),
			isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text(),
			isbn = isbn13.split(':')[1].replace(/\D/g,'');
		if	($('.a-link-normal.contributorNameID:first').length){
			author = $('.a-link-normal.contributorNameID:first').text();			
		} else {
			author = $('.author .a-link-normal:eq(0)').text();			
		}

		isBook = true;

	} 

	if (isEBook == true| isBook == true){
	
		//Base for library catalog search
		var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
		//URL for ISBN search
		var isbnURL = base + isbn;
		//URL to search catalog by title and author for books
		var taURL = base+encodeURIComponent(title+" "+author).replace(/'/g, "%27")+"&te=&lm=BOOKS";
		//URL to search catalog for ebooks
		var ebookURL = base+"TITLE%3D"+encodeURIComponent(title+" ").replace(/'/g, "%27")+"&qu=AUTHOR%3D"+encodeURIComponent(author).replace(/'/g, "%27")+"&qf=FORMAT%09Bibliographic+Format%09E_BOOK%09eBook";
		//URL to request library purchase
		var purchaseURL = "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X";

		//Determine where to place information on page and run search
		if (isEBook == true){

			if ($('div.kicsBoxContents').length){

		        var container = $('div.kicsBoxContents:first');    
			    container.before("<div id='dcpl_digital'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div>  <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div> </div>");
		    	var modify_digital = $("div#digital");
			    var modify_book = $("div#book");
		
			    searchCatalog(modify_book,modify_digital,taURL,taURL,ebookURL,purchaseURL,isBook,isEBook);

		    } 	

		} else {

			if ($('div.a-box.rbbSection.selected.dp-accordion-active').length){

		        var container = $('div.a-box.rbbSection.selected.dp-accordion-active');    
			    container.prepend("<div id='dcpl' class='a-box'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div> <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div> </div>");
		    	var modify_digital = $("div#digital");
			    var modify_book = $("div#book");

				searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL,isBook,isEBook);

			} else if ($('div#unqualifiedBuyBox').length){

		        var container = $('div#unqualifiedBuyBox');
			    container.prepend("<div id='dcpl' class='a-box'><div id='dcpl_title'>DCPL Search</div> <div id='category'>Library Catalog</div> <div id='book'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div> <div id='category'>Digital Catalog</div> <div id='digital'>Searching catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </div> </div>");
		    	var modify_digital = $("div#digital");
			    var modify_book = $("div#book");
	
				searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL,isBook,isEBook);

		    }
		}		
	}

	function searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL,isBook,isEBook) {

			//search by ISBN (or title/author URL if on Amazon ebook page and don't know ISBN)
	     	$.get(isbnURL,
		        function(data){
		            
		            var oneline = $(data).text().replace(/\n/g,"");
		            
		            try {
			      			var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/,"$1"));
			            	var available = availabilityJSON['totalAvailable'].toString();
			            	var total = availabilityJSON['copies'][0].match(/(\d+)$/)[1];
			            	var wait = availabilityJSON['holdCounts'][0].match(/(\d+)$/)[1];

					        if (total.match(/^1$/)!=null){
				            	var total_statement = total + " copy";
				            } else if (total.match(/^[0-9]+$/)!=null){
				            	var total_statement = total + " copies";	            	
				            }

				            if (wait.match(/^1$/)!=null){
				            	var wait_statement = wait + " patron waiting"
				            } else if (wait.match(/^[0-9]+$/)!=null) {
				            	var wait_statement = wait + " patrons waiting"	            	
				            }

			            	if (wait.match(/^[0-9]+$/)!=null && wait.match(/^0$/)==null && available.match(/^0$/)!=null && total.match(/^[0-9]+$/)!=null){
			                	modify_book.html("<a id='results' href = '" + isbnURL + "'> Book located </a> <br>"+total_statement+" ("+wait_statement+")");
			            	} else {
			                	modify_book.html("<a id='results' href = '" + isbnURL + "'> Book located </a> <br>"+total_statement+" ("+available+" available)");
			            	}

		            	} catch (e) {
			            	if (isEBook==true){
			            		if (oneline.match("This search returned no results.")!=null){
			                		modify_book.html("Book not located <br> <a id='results' href = '" + taURL + "'>Search manually</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");	            	
			            		} else {
			               			 modify_book.html("Uncertain match <br> <a id='results' href = '" + taURL + "'>View results</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");
			            		}	            	
			            	} else {
				            	taSearch(modify_book,taURL,purchaseURL);	            				            		
			            	}
		            	}
		        }
		    );

			//Determine Overdrive ID to search Overdrive catalog
			$.get(ebookURL,
		        function(data){
		            
		            var oneline = $(data).text().replace(/\n/g,""),
		            	overdrive_id = oneline.replace(/.*fOVERDRIVE\:(.+?)\$.*/,"$1"),
		            	overdriveURL = "http://overdrive.dclibrary.org/ContentDetails.htm?id="+overdrive_id;
		            
		            if (overdrive_id.length>100){
	                	modify_digital.html("E-book not located <br> <a id='results' href = 'http://overdrive.dclibrary.org/'>Search manually</a>");            		
		            } else {
			            overdriveSearch(modify_digital,overdriveURL,purchaseURL);		            	
		            }
		        }
		    );   
	}

	function taSearch(modify_book,taURL,purchaseURL){

			//Search library catalog by title/author
	     	$.get(taURL,
	        function(data){
	            
	            var oneline = $(data).text().replace(/\n/g,"");

	            try {
		      			var book_json = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/,"$1"));
		            	var available = book_json['totalAvailable'].toString();
		            	var total = book_json['copies'][0].match(/(\d+)$/)[1];
		            	var wait = book_json['holdCounts'][0].match(/(\d+)$/)[1];

				        if (total.match(/^1$/)!=null){
			            	var total_statement = total + " copy";
			            } else if (total.match(/^[0-9]+$/)!=null){
			            	var total_statement = total + " copies";	            	
			            }

			            if (wait.match(/^1$/)!=null){
			            	var wait_statement = wait + " patron waiting"
			            } else if (wait.match(/^[0-9]+$/)!=null) {
			            	var wait_statement = wait + " patrons waiting"	            	
			            }

		            	if (wait.match(/^[0-9]+$/)!=null && wait.match(/^0$/)==null && available.match(/^0$/)!=null && total.match(/^[0-9]+$/)!=null){
		                	modify_book.html("<a id='results' href = '" + isbnURL + "'> Book located </a> <br>"+total_statement+" ("+wait_statement+")");
		                } else {
		                	modify_book.html("<a id='results' href = '" + taURL + "'> Book located </a> <br> "+total_statement+" copies ("+available+" available)");
		            	}

	            	} catch (e) {
						if (oneline.match("This search returned no results.")!=null){
			                modify_book.html("Book not located <br> <a id='results' href = '" + taURL + "'>Search manually</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");	            	
			            } else {
			                modify_book.html("Uncertain match <br> <a id='results' href = '" + taURL + "'>View results</a> <br> <a id='results' href = '" + purchaseURL + "'>Request purchase</a>");
			            }	            	
			        }
	        }
	    );   
	}

	function overdriveSearch(modify_digital,overdriveURL,purchaseURL){

		//Search Overdrive catalog
		$.get(overdriveURL,
			function(data){
				
				var oneline = $(data).text().replace(/\n/g,"");
				var availability = oneline.replace(/.*Copies-Available:(\d+)Library copies:(\d+)var deNumWaiting = (\d+?)\;.*/,"$1,$2,$3");
	            var available = availability.split(',')[0];
	            var total = availability.split(',')[1];
	            var wait = availability.split(',')[2];

	            if (total.match(/^1$/)!=null){
	            	var total_statement = total + " copy";
	            } else if (total.match(/^[0-9]+$/)!=null){
	            	var total_statement = total + " copies";	            	
	            }

	            if (wait.match(/^1$/)!=null){
	            	var wait_statement = wait + " patron waiting"
	            } else if (wait.match(/^[0-9]+$/)!=null) {
	            	var wait_statement = wait + " patrons waiting"	            	
	            }

        		if (wait.match(/^[0-9]+$/)!=null && wait.match(/^0$/)==null && total.match(/^[0-9]+$/)!=null){
            		modify_digital.html("<a id='results' href = '" + overdriveURL + "'> E-book located </a> <br>"+total_statement+" ("+wait_statement+")</a>");
        		} else if (available.match(/^[0-9]+$/)!=null && total.match(/^[0-9]+$/)!=null) {
                	modify_digital.html("<a id='results' href = '" + overdriveURL + "'> E-book located </a> <br> "+total_statement+" ("+available+" available)</a>");
            	} else {
                	modify_digital.html("E-book not located <br> <a id='results' href = 'http://overdrive.dclibrary.org/'>Search manually</a>");            		
            	}
			});
	}
}


