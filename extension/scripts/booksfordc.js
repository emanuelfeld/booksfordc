if (/amazon\.com$/.test(document.domain)) {
	//locate ISBN13
	var isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
	var isbn = isbn13.split(':')[1].replace(/\D/g,'');

	//format search URL for DCPL
	var base = "http://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu=";
	var searchURL = base + isbn;

	//URL to request library purchase
	var purchaseURL = "http://citycat.dclibrary.org/uhtbin/cgisirsi/x/ML-KING/x/63/1100/X";

	//assign title and author for search link, if isbn search fails
	var title = $('#productTitle').text();
	var author = $('.a-link-normal.contributorNameID:first').text();
	var altURL = (base+encodeURIComponent(title+" "+author).replace(/'/g, "%27"));

	if(isbn.length==13){

	    //determine where to prepend booksfordc div
	    if($('div#unqualifiedBuyBox').length){
	        var container = $('div#unqualifiedBuyBox');
	    } else if ($('div.a-box.rbbSection.selected.dp-accordion-active').length){
	        var container = $('div.a-box.rbbSection.selected.dp-accordion-active');    
	    }
	    
	    container.prepend("<div id='dcpl' class='a-box'><span id='dcpl_title'>DCPL Search</span> <br> Searching catalog by ISBN <img src='"+chrome.extension.getURL('assets/ajax-loader.gif')+"'></div>");
	    
	    var modify = $("div#dcpl");
	    
	    doAjax(title,author,searchURL,altURL,modify,purchaseURL);
	}

	function doAjax(title,author,url,alt,where,purchase){

			//load and format data from catalog search
	     	$.get(url,
	        function(data){
	        	var dcpl = $(data),
	            	oneline = dcpl.text().replace(/\n/g,""),
	                available = oneline.replace(/.*totalAvailable\" : ([0-9]+).*/,"$1"),
	                total = oneline.replace(/.*copies\" \: [    "[0-9]+\,([0-9]+).*/,"$1");
	            if(available.match(/^[0-9]+$/)!=null && total.match(/^1$/)!=null){
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br>Located in catalog <br> <a href = '" + searchURL + "'>"+total+" Copy ("+available+" Available)</a> </div></div></div>");
	            } else if(available.match(/^[0-9]+$/)!=null && total.match(/^[0-9]+$/)!=null){
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br> Located in catalog <br> <a href = '" + searchURL + "'>"+total+" Copies ("+available+" Available)</a> </div></div></div>");
	            } else {
	                where.html("<span id='dcpl_title'>DCPL Search</span> <br> No results found for this edition <br> <a href = '" + alt + "'>Search by Title and Author</a> <br> <a href = '" + purchase + "'>Request Purchase</a> </div></div></div>");
	            }
	        }
	    );   
	}
}