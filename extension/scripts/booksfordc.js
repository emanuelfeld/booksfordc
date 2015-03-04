if (/amazon\.com$/.test(document.domain)) {

	//locate ISBN13
	var isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
	var isbn = isbn13.split(':')[1].replace(/\D/g,'');

	//locate book title and author
	var title_regex = /\(.*\)/g,
		title = $('#productTitle').text().replace(title_regex,"").replace(),
		author = $('.a-link-normal.contributorNameID:first').text();

	//URLs

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


	if(isbn.length==13){

	    //determine where to prepend booksfordc div
		if ($('div.a-box.rbbSection.selected.dp-accordion-active').length){
	        var container = $('div.a-box.rbbSection.selected.dp-accordion-active');    
	    } else if($('div#unqualifiedBuyBox').length){
	        var container = $('div#unqualifiedBuyBox');
	    }
	    
	    container.prepend("<div id='dcpl' class='a-box'><span id='dcpl_title'>DCPL Search</span> <br> <strong>Book Catalog</strong> <br> <span id='book'>Searching library catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </span>  <br> <strong>Digital Catalog</strong> <br> <span id='digital'>Searching digital catalog <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'> </span> </div>");

	    var modify_digital = $("span#digital");
	    var modify_book = $("span#book");

	    searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL);
	}

	function searchCatalog(modify_book,modify_digital,isbnURL,taURL,ebookURL,purchaseURL) {

	     	$.get(isbnURL,
		        function(data){
		            var oneline = $(data).text().replace(/\n/g,"");
		            try {
			      			var availabilityJSON = JSON.parse(oneline.replace(/.*parseDetailAvailabilityJSON\((.+?)\)\;.*/,"$1"));
			            	var available = availabilityJSON['totalAvailable'].toString();
			            	var total = availabilityJSON['copies'][0].match(/(\d+)$/)[1];
			            	if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
			                	modify_book.html("Located in catalog <br> <a href = '" + isbnURL + "'>"+total+" Copy ("+available+" Available)</a>");
			            	} else {
			                	modify_book.html("Located in catalog <br> <a href = '" + isbnURL + "'>"+total+" Copies ("+available+" Available)</a>");
			            	}
		            	} catch (e) {
			            	taSearch(modify_book,taURL,purchaseURL);	            	
		            	}
		        }
		    );

			$.get(ebookURL,
		        function(data){
		            var oneline = $(data).text().replace(/\n/g,""),
		            	overdrive_id = oneline.replace(/.*fOVERDRIVE\:(.+?)\$.*/,"$1"),
		            	overdriveURL = "http://overdrive.dclibrary.org/ContentDetails.htm?id="+overdrive_id;
		            if(overdrive_id.length>100){
	                	modify_digital.html("Not located in digital catalog <br> <a href = 'http://overdrive.dclibrary.org/'>Search manually</a>");            		
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
		                	modify_book.html("Located in catalog <br> <a href = '" + taURL + "'>"+total+" Copy ("+available+" Available)</a>");
		            	} else {
		                	modify_book.html("Located in catalog <br> <a href = '" + taURL + "'>"+total+" Copies ("+available+" Available)</a>");
		            	}
	            	} catch (e) {
						if (oneline.match("This search returned no results.")!=null){
			                modify_book.html("Not located in catalog <br> <a href = '" + taURL + "'>Search manually</a> <br> <a href = '" + purchaseURL + "'>Request Purchase</a>");	            	
			            } else {
			                modify_book.html("Multiple possible matches <br> <a href = '" + taURL + "'>View results</a> <br> <a href = '" + purchaseURL + "'>Request Purchase</a>");
			            }	            	
			        }
	        }
	    );   
	}

	function overdriveSearch(modify_digital,overdriveURL,purchaseURL){
		$.get(overdriveURL,
			function(data){
				var oneline = $(data).text().replace(/\n/g,"");
	            var available = oneline.replace(/.*Available:(\d+).*/,"$1");
	            var total = oneline.replace(/.*Library copies:(\d+).*/,"$1");
            	if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
                	modify_digital.html("E-book located in catalog <br> <a href = '" + overdriveURL + "'>"+total+" Copy ("+available+" Available)</a>");
            	} else if(available.match(/^[0-9]+$/)!=null && total.match(/^[0-9]+$/)!=null) {
                	modify_digital.html("E-book located in catalog <br> <a href = '" + overdriveURL + "'>"+total+" Copies ("+available+" Available)</a>");
            	} else {
                	modify_digital.html("Not located in digital catalog <br> <a href = 'http://overdrive.dclibrary.org/'>Search manually</a>");            		
            	}
			});
	}

	}


