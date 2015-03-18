#!/usr/bin/env python

import scraperwiki, re, lxml.html, time

def clean(thing):
    thing = re.sub(r'^\s*(.*?)\s*$',r'\1',thing)
    thing = re.sub(r'\n',r' ',thing)
    return thing

for i in xrange(1,100):
    print i
    page = 'http://dclibrary.freegalmusic.com/genres/ajax_view_pagination/page:'+str(i)+'/QWxs/All'
    try:
        html=scraperwiki.scrape(page)
        root = lxml.html.fromstring(html)
        for x in root.cssselect("body li a"):
            music = {
                "artist": clean(x.text_content()),
                "url": "http://dclibrary.freegalmusic.com"+clean(x.xpath('@href')[0])            
                }
            scraperwiki.sql.save(unique_keys=['url'], data=music)
    except:
        print "Not scraped: "+page
    time.sleep(30)
