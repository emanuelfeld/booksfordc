![banner](https://github.com/emanuelfeld/booksfordc/blob/master/promo/PromoLarge.png)

Assorted projects aimed at making the DC Public Library's resources more accessible and useful for DC residents. Drop me a line [@evonfriedland](https://twitter.com/evonfriedland) if you're interested. Promotional materials (banners, flyer) in the [promo folder](https://github.com/emanuelfeld/booksfordc/tree/master/promo) to spread the word!

##Next up##

* Set up focus group a MLK Jr Dream Lab and/or write and distribute a printed questionnaire to library patrons
* Do more outreach with local education and literacy non-profits and DCPS librarians, teachers, students, and parents
* Streamline code to make it easier to maintain

##So far##

###Catalog feed###

Due to issues with the DCPL's OPAC technology, RSS feeds for its catalog do not syndicate properly. The script in scraper.py is run hourly on ScraperWiki to generate a Twitter feed of new additions to the DCPL book catalog. Follow with [@booksfordc](https://twitter.com/booksfordc). You can also subscribe to a daily or weekly email digest of new resources using [these IFTTT recipes](https://ifttt.com/p/evonfriedland/shared).

###Library search-bot###

Twitter users can also use the [@booksfordc](https://twitter.com/booksfordc) account to quickly query the library catalog. 

To look up a book, send a tweet in the form:

    @booksfordc search: book_title book_author

For ebooks, do:

    @booksfordc ebook search: book_title book_author
    
And for an audiobook search, do:

    @booksfordc audio search: book_title book_author

The bot will then respond directly to your account saying whether it found a match (or multiple possible matches) and with the search/resource URL. Usually this will only take a minute or two.

In actuality, the bot will accept any mention structured:

    @booksfordc resource_type search_init search_terms

Where ```resource_type``` is:

* ```b```, ```bk```, or ```book``` for physical books
* ```e```, ```ebk```, ```e-bk```, ```ebook```, or ```e-book``` for electronic books
* ```a```, ```abk```, ```a-bk```, ```audio```, ```audiobook```, or ```audio-book``` for audiobooks

Where ```search_init``` is one of: 

* ```f```,```f:```,```s```, ```s:```, ```search```, ```search:```, ```find```, or ```find:```

And where ```search_terms``` includes either the book title and/or author or the book's ISBN.

An author and title combination search will yield the best results. If you only use one of those, you're more likely to end up with multiple possible matches. If you use the ISBN, you run the risk of an erroneous 'Not found' response, since the DCPL might have a different edition (with different ISBN). If you do use ISBN, it should be ISBN-13 and not ISBN-10. The latter will not work.

###Browser plug-in###

A Chrome extension that displays library holdings and availability when browsing books on Amazon, Goodreads, or Barnes & Noble. Download for free for [![ch](https://raw.githubusercontent.com/emanuelfeld/booksfordc/gh-pages/images/chrome16.png) Chrome](https://chrome.google.com/webstore/detail/booksfordc/plbkclaloadjhljkijjnlingopbahndg) or [![ff](https://raw.githubusercontent.com/emanuelfeld/booksfordc/gh-pages/images/firefox16.png) Firefox](https://addons.mozilla.org/en-US/firefox/addon/booksfordc/). Safari version in the works.

![screenshot](https://cloud.githubusercontent.com/assets/4269640/7082805/c70207ba-df27-11e4-940e-87dbb4d41505.png)

##I'd like my Code for America Brigade to use this in my Metro -- how?#
* "Books for" depends on Overdrive for eBooks/AudioBooks and SirsiDynix for the general catalog. Overdrive is fairly standard, but Sirsi varies by instance so some customization might be required on those calls.
* It uses a combination of RegEx and XPATH queries to determine availability. If you'd like to fork it for your area and customize these, reach out in the issues for assistance. 

####License and Contributing####

This project's code is offered under a GPLv2 license. As stated in [CONTRIBUTING](https://github.com/emanuelfeld/booksfordc/blob/master/CONTRIBUTING.txt):

> By contributing to this repo, you agree to license your work under the same license.
