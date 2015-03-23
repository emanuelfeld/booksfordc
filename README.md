![banner](https://github.com/emanuelfeld/booksfordc/blob/master/banners/PromoLarge.png)

Assorted projects aimed at making the DC Public Library's resources more accessible and useful for DC residents. Drop me a line [@evonfriedland](https://twitter.com/evonfriedland) if you're interested.

##@booksfordc##

###Catalog feed###
Due to issues with the DCPL's OPAC technology, RSS feeds for its catalog do not syndicate properly. The script in scraper.py is run hourly on ScraperWiki to generate a Twitter feed of new additions to the DCPL book catalog. Follow [@booksfordc](https://twitter.com/booksfordc).

###Twitter bot###
Twitter users can also use the [@booksfordc](https://twitter.com/booksfordc) account to quickly query the library catalog. To look up a book, send a tweet in the form ```@booksfordc search: book_title book_author``` or ```@booksfordc s: book_title book_author```. For ebook lookup, do ```@booksfordc ebook search: book_title book_author``` or ```@booksfordc ebk s: book_title book_author```. And for an audiobook search, do ```@booksfordc audio search: book_title book_author``` or ```@booksfordc abk s: book_title book_author```.

In actuality, the bot will accept any mention structured:

    @booksfordc resource_type search_init book_title book_author

Where ```resource_type``` is ```b```, ```bk```, or ```book``` for physical books, ```e```, ```ebk```, ```e-bk```, ```ebook```, or ```e-book``` for electronic books, or ```a```, ```abk```, ```a-bk```, ```audio```, ```audiobook```, or ```audio-book``` for audiobooks, and where ```search_init``` is one of ```f```,```f:```,```s```, ```s:```, ```search```, ```search:```, ```find```, or ```find:```. 

The bot will then respond directly to the account that sent the query saying whether it found a match (or multiple possible matches) and with the search/resource URL.

###Browser plug-in###
A Chrome extension that displays library holdings and availability when browsing books on Amazon, Goodreads, or Barnes & Noble. Download for free for [Chrome](https://chrome.google.com/webstore/detail/booksfordc/plbkclaloadjhljkijjnlingopbahndg) or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/booksfordc/). Safari version in the works.

![image](https://cloud.githubusercontent.com/assets/4269640/6477965/8fe3d6ac-c1f7-11e4-82a1-401a4ae68a88.png)

####License and Contributing####

This project's code is offered under a GPLv2 license. As stated in [CONTRIBUTING](https://github.com/emanuelfeld/booksfordc/blob/master/CONTRIBUTING.txt):

> By contributing to this repo, you agree to license your work under the same license.
