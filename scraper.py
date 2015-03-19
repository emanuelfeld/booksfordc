#!/usr/bin/env python

import scraperwiki, re, lxml.html, time

def clean(thing):
    thing = re.sub(r'^\s*(.*?)\s*$',r'\1',thing)
    thing = re.sub(r'\n',r' ',thing)
    return thing

alphabet = ['spl','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

for l in alphabet:
    print l
    i = 1
    ok = True
    while ok==True:
        page = 'http://dclibrary.freegalmusic.com/genres/ajax_view_pagination/page:'+str(i)+'/QWxs/'+l
        try:
            html=scraperwiki.scrape(page)
            root = lxml.html.fromstring(html)
            for x in root.cssselect("body li a"):
                music = {
                    "artist": clean(x.text_content()),
                    "url": "http://dclibrary.freegalmusic.com"+clean(x.xpath('@href')[0])            
                    }
                scraperwiki.sql.save(unique_keys=['url'], data=music)
            print i
            time.sleep(10)
        except:
            ok = False
        i+=1
