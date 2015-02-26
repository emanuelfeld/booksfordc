# booksfordc

Scrapes DC Public Library's improperly syndicating RSS feeds to generate a listing of new additions to the book catalog.

Scraper running on [morph.io](https://morph.io/evonfriedland/booksfordc) and tweeting at [@booksfordc](https://twitter.com/booksfordc).

##To do##
* ~~Caching~~
* ~~Check cache~~
* ~~RSS feed~~
* ~~Use Twitter API directly, with staggered posts (<1/min) instead of IFTTT~~
* ~~Host cron job elsewhere to trigger more frequent automatic scrapes (Tweepy and Heroku?)~~ Using ScraperWiki for now
* Decide where to host the cache if use host without persistent memory (GitHub?)
* Make script clean and reproduceable for other libraries using SirsiDynix

##Notes##
* Benning Neighborhood Library RSS fails
* Shepherd Park Neighbordhood Library RSS fails
* Watha T. Daniel/Shaw Library RSS fails
* Bellevue Neighborhood Library RSS fails
* On occasion, books are not being allocated to an audience (adults, teens, children) and so will fail to show up in search
