if (/amazon\.com$/.test(document.domain)) {
	//locate ISBN13
	var isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
	var isbn = isbn13.split(':')[1].replace(/\D/g,'');

	//format search URL for DCPL
	var base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
	var bookURL = base + isbn;

	//URL to request library purchase
	var purchaseURL = "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X";

	//assign title and author for search link, if isbn search fails
	var title = $('#productTitle').text().replace(/\(.*\)/g,"").replace();
	var author = $('.a-link-normal.contributorNameID:first').text();
	var altURL = base+encodeURIComponent(title+" "+author).replace(/'/g, "%27")+"&te=&lm=BOOKS";
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
	        	var dcpl = $(data),
	            	oneline = dcpl.text().replace(/\n/g,""),
	                available = oneline.replace(/.*totalAvailable\" : ([0-9]+).*/,"$1"),
	                total = oneline.replace(/.*copies\" \: [ *"[0-9]+\,([0-9]+).*/,"$1");
	            if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br>Located in catalog <br> <a href = '" + url + "'>"+total+" Copy ("+available+" Available)</a>");
	            } else if(available.match(/^[0-9]+$/)!=null && total.match(/^[0-9]+$/)!=null){
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br> Located in catalog <br> <a href = '" + url + "'>"+total+" Copies ("+available+" Available)</a>");
	            } else {
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
	        	var dcpl = $(data),
	            	oneline = dcpl.text().replace(/\n/g,""),
	                available = oneline.replace(/.*totalAvailable\" : ([0-9]+).*/,"$1"),
	                total = oneline.replace(/.*copies\" \: [ *"[0-9]+\,([0-9]+).*/,"$1");
	            if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br>Located in catalog <br> <a href = '" + url + "'>"+total+" Copy ("+available+" Available)</a>");
	            } else if(available.match(/^[0-9]+$/)!=null && total.match(/^[0-9]+$/)!=null){
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br> Located in catalog <br> <a href = '" + url + "'>"+total+" Copies ("+available+" Available)</a>");
	            } else {
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br> No results found for this edition <br> <a href = '" + alt + "'>Search manually</a> <br> <a href = '" + purchase + "'>Request Purchase</a>");
	            }
	        }
	    );   
	}


}