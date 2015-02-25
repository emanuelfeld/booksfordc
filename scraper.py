#!/usr/bin/env python

import scraperwiki
import requests
import re
import lxml.html
from datetime import datetime
import time

def clean_xml(x):
    x = re.sub(r'<link rel="self" href="/client" />',r'<link href="http://catalog.dclibrary.orghttps//catalog.dclibrary.org/client/rss/hitlist/dcpl/"/>',x)
    x = re.sub(r'rel="alternate" type="html" href="https://catalog.dclibrary.org/client/en_US/dcpl/search/detailnonmodal\?qf=.*ent%3A%2F%2FSD_ILS%2F0%2FSD_ILS%3A(\d+).*',r'href="https://catalog.dclibrary.org/client/en_US/dcpl/search/detailnonmodal/ent:$002f$002fSD_ILS$002f0$002fSD_ILS:\1/ada"/>',x)
    x = re.sub(r'ent://SD_ILS/0/SD_ILS:(\d+)',r'https://catalog.dclibrary.org/client/en_US/dcpl/search/detailnonmodal/ent:$002f$002fSD_ILS$002f0$002fSD_ILS:\1/ada',x)
    x = re.sub(r'http://catalog.dclibrary.orghttps://catalog.dclibrary.org/client/en_US/dcpl/dcpl/ps\$003d1000\?dt=list',r'http://catalog.dclibrary.orghttps//catalog.dclibrary.org/client/en_US/dcpl/dcpl/ps$003d1000?dt=list',x)
    x = re.sub(r'(\d+)/ada</id>',r'\1/ada</id>\n\t<ils>\1</ils>',x)
    x = re.sub(r'<content type="html">Author\&amp;\#160;',r'<author>',x)
    x = re.sub(r'\&lt\;.*',r'</author>',x)
    x = re.sub(r'\&amp\;\#160;',r' ',x)
    x = re.sub(r'<author>(\w+)\,.*</author>',r'<author>\1</author>',x)
    x = re.sub(r'\..*</author>',r'</author>',x)
    x = re.sub(r'\,.*</author>',r'</author>',x)
    return x

def check_store(y):
    try:
        return len(scraperwiki.sql.select("* from store where ils=(?)", (y['ils'],)))
    except:
        return 0

def scrape(y):                
    try:
        html = scraperwiki.scrape(y)
        root = lxml.html.fromstring(clean_xml(html))
        j,k=0,0
        for entry in root.cssselect('feed entry'):
            current = {
                'title' : str(entry[0].text_content()),
                'url' : entry.xpath('child::link/@href')[0],
                'ils' : entry.xpath('child::ils/text()')[0],
                'pub' : int(p),
                'format' : re.sub(r'.*09',r'',str(f)),
                'audience' : re.sub(r'.*09',r'',str(a)),
                'pubDate' : str(datetime.now()),
                'author' : entry[6].text_content()
                }
            if check_store(current)==0:
                j=j+1
                print current['title']
                scraperwiki.sql.save(unique_keys=['ils'], data=current,table_name="current")
                scraperwiki.sql.save(unique_keys=['ils'], data={'ils' : current['ils'], 'scrape_date' : current['pubDate']},table_name="store")
            else:
                k=k+1
        print str(j)+" new items\n"+str(k)+" already added\n"
    except:
        print "Could not scrape\n"
    time.sleep(5)

pubyears = ["2015"] # Not getting very accurate results for past years: "2014","2013","2012," since new entries aren't being displayed in XML feeds. Also slow to scrape them all.
formats = ["BOOK%09Books"]
audiences = ["ADULT%09Adults", "JUVENILE%09Children", "YOUNGADULT%09Teens"]
libraries = ["ANACOSTIA%09Anacostia+Neighborhood+Library",
            "BENNING%09Dorothy+I.+Height%2FBenning+Neighborhood+Library", 
            "CAP-VIEW%09Capitol+View+Neighborhood+Library", 
            "CHEVYCHASE%09Chevy+Chase+Neighborhood+Library", 
            "CLEVE-PARK%09Cleveland+Park+Neighborhood+Library", 
            "DEANWOOD%09Deanwood+Neighborhood+Library", 
            "FR-GREGORY%09Francis+A.+Gregory+Neighborhood+Library", 
            "SHEPARK-JT%09Juanita+E.+Thornton+%2F+Shepherd+Park+Neighborhood+Library", 
            "LAMD-RIGGS%09Lamond-Riggs+Neighborhood+Library", 
            "ML-KING%09Martin+Luther+King+Jr.+Memorial+Library", 
            "MTPLEASANT%09Mt.+Pleasant+Neighborhood+Library", 
            "NORTHEAST%09Northeast+Neighborhood+Library", 
            "NORTHWEST1%09Northwest+One+Neighborhood+Library", 
            "PALISADES%09Palisades+Neighborhood+Library", 
            "PARKLANDS%09Parklands-Turner+Neighborhood+Library", 
            "PETWORTH%09Petworth+Neighborhood+Library", 
            "ROSEDALE%09Rosedale+Neighborhood+Library", 
            "SCHOOLPBEC%09School+Pilot+Charter+BEC", 
            "SOUTHEAST%09Southeast+Neighborhood+Library", 
            "SOUTHWEST%09Southwest+Neighborhood+Library", 
            "TAKOMA-PK%09Takoma+Park+Neighborhood+Library", 
            "TENLEY%09Tenley-Friendship+Neighborhood+Library", 
            "WT-DANIEL%09Watha+T.+Daniel%2FShaw++Neighborhood+Library", 
            "WESTEND%09West+End+Neighborhood+Library", 
            "BELLEVUE%09William+O.+Lockridge%2FBellevue+Neighborhood+Library", 
            "WOODRIDGE%09Woodridge+Neighborhood+Library"]

scraperwiki.sql.execute("DELETE * FROM current")

i=0
for p in pubyears:
    for f in formats:
        for a in audiences:
            for l in libraries:
                print str(i)+":  "+l+" "+p+" "+a
                i=i+1
                scrape("https://catalog.dclibrary.org/client/rss/hitlist/dcpl/qf=LIBRARY%09Library%091%3A"+l+"&qf=PUBDATE%09Publication+Date%09"+p+"%09"+p+"&qf=ITEMCAT2%09Audience%091%3A"+a+"&qf=FORMAT%09Bibliographic+Format%09"+f)

# MLK Jr Library marks certain fiction books as 'newbooks' so that they can be physically located in 
# the 'New Book Area.' This allows us to find some new books published in prior years.
scrape("https://catalog.dclibrary.org/client/rss/hitlist/dcpl/qu=newbooks")

