# booksfordc
Assorted projects aimed at making the DC Public Library's resources more accessible and useful for DC residents.

##@booksfordc##
Due to issues with the DCPL's OPAC technology, RSS feeds for its catalog do not syndicate properly. The script in scraper.py is run hourly on ScraperWiki to generate a Twitter feed of new additions to the DCPL book catalog. Follow at [@booksfordc](https://twitter.com/booksfordc).

###To do###
* ~~Caching~~
* ~~Check cache~~
* ~~RSS feed~~
* ~~Use Twitter API directly, with staggered posts (<1/min) instead of IFTTT~~
* ~~Host cron job elsewhere to trigger more frequent automatic scrapes (Tweepy and Heroku?)~~ Using ScraperWiki for now
* ~~Decide where to host the cache if use host without persistent memory (GitHub?)~~ Not currently an issue
* Add ebooks, if the DCPL makes the Overdrive API accessible. Possibly just use Sirsi catalog, though harder to scrape, because resources not divided across libraries (and hence 1000 item XML limit passed)

###Notes###
* Benning Neighborhood Library RSS fails
* Shepherd Park Neighbordhood Library RSS fails
* Watha T. Daniel/Shaw Library RSS fails
* Bellevue Neighborhood Library RSS fails
* On occasion, books are not being allocated to an audience (adults, teens, children) and so will fail to show up in search

##Browser Plug-in##
A Chrome extension that displays library holdings and availability when browsing books on Amazon.com. Searches the catalog by  ISBN-13 value. If no match is found (because the edition or book is not held at DCPL), the extension provides a link to search the catalog by title and author, as well as a link to request that the library purchase the material.

Download the booksfordc extension by clicking on extension.crx and then 'Raw.' Open up chrome://extensions, locate the downloaded file, and drag it into the extensions window.

###To do###
* Improve search functionality to cover multiple editions—is it better to search by title, author, and resource type, then take the first hit (if it exists?). Doesn't appear that it will automatically redirect with this sort of search, even if only one result.
* Port to Firefox (Safari?)
* Allow for functionality on Goodreads and, perhaps, Barnes and Noble
* Search Overdrive, if the DCPL makes the API accessible (and don't require a private key). Possibly just use Sirsi catalog, get Overdrive ID from result URL and go from there.
* Auto-fill parts of the purchase request form with title, author, etc. info from Amazon page

![image](https://cloud.githubusercontent.com/assets/4269640/6434397/0f72cb74-c056-11e4-8f14-e745bff6e1bc.png)
