#!/usr/bin/env python

import scraperwiki
import requests
import re
import lxml.html
try: import simplejson as json
except ImportError: import json
import urllib2
from datetime import datetime

#existing_records = urllib2.urlopen('https://free-ec2.scraperwiki.com/r2frpmx/sqtharyhyev1kwe/sql/?q=select%20%0A%09format%2C%0A%09url%2C%0A%09title%2C%0A%20%20%20%20ils%0Afrom%20swdata%0A--%20where%20title%20%3E%20%0Aorder%20by%20ils%0A').read()
#existing_records = json.loads(existing_records)

#ex_list=[]
#for x in existing_records:
#    ex_list.append(x['ils'])
#print ex_list


def clean_xml(x):
    x = re.sub(r'<link rel="self" href="/client" />',r'<link href="http://catalog.dclibrary.orghttps//catalog.dclibrary.org/client/rss/hitlist/dcpl/"/>',x)
    x = re.sub(r'rel="alternate" type="html" href="https://catalog.dclibrary.org/client/en_US/dcpl/search/detailnonmodal\?d=ent%3A%2F%2FSD_ILS%2F0%2FSD_ILS%3A(\d+)%7EILS%7E0%7E451243&amp;ps=1000" title.*/>',r'href="https://catalog.dclibrary.org/client/en_US/dcpl/search/detailnonmodal/ent:$002f$002fSD_ILS$002f0$002fSD_ILS:\1"/>',x)
    x = re.sub(r'ent://SD_ILS/0/SD_ILS:',r'https://catalog.dclibrary.org/client/en_US/dcpl/search/detailnonmodal/ent:$002f$002fSD_ILS$002f0$002fSD_ILS:',x)
    x = re.sub(r'http://catalog.dclibrary.orghttps://catalog.dclibrary.org/client/en_US/dcpl/dcpl/ps\$003d1000\?dt=list',r'http://catalog.dclibrary.orghttps//catalog.dclibrary.org/client/en_US/dcpl/dcpl/ps$003d1000?dt=list',x)
    x = re.sub(r'(\d+)</id>',r'\1</id>\n\t\t<ils>\1</ils>',x)
    return x

formats = ["BOOK%09Books"]
libraries = ["ANACOSTIA%09Anacostia+Neighborhood+Library", "CAP-VIEW%09Capitol+View+Neighborhood+Library", "CHEVYCHASE%09Chevy+Chase+Neighborhood+Library", "CLEVE-PARK%09Cleveland+Park+Neighborhood+Library", "DEANWOOD%09Deanwood+Neighborhood+Library", "BENNING%09Dorothy+I.+Height%2FBenning+Neighborhood+Library", "FR-GREGORY%09Francis+A.+Gregory+Neighborhood+Library", "SHEPARK-JT%09Juanita+E.+Thornton+%2F+Shepherd+Park+Neighborhood+Library", "LAMD-RIGGS%09Lamond-Riggs+Neighborhood+Library", "ML-KING%09Martin+Luther+King+Jr.+Memorial+Library", "MTPLEASANT%09Mt.+Pleasant+Neighborhood+Library", "NORTHEAST%09Northeast+Neighborhood+Library", "NORTHWEST1%09Northwest+One+Neighborhood+Library", "PALISADES%09Palisades+Neighborhood+Library", "PARKLANDS%09Parklands-Turner+Neighborhood+Library", "PETWORTH%09Petworth+Neighborhood+Library", "ROSEDALE%09Rosedale+Neighborhood+Library", "SCHOOLPBEC%09School+Pilot+Charter+BEC", "SOUTHEAST%09Southeast+Neighborhood+Library", "SOUTHWEST%09Southwest+Neighborhood+Library", "TAKOMA-PK%09Takoma+Park+Neighborhood+Library", "TENLEY%09Tenley-Friendship+Neighborhood+Library", "WT-DANIEL%09Watha+T.+Daniel%2FShaw++Neighborhood+Library", "WESTEND%09West+End+Neighborhood+Library", "BELLEVUE%09William+O.+Lockridge%2FBellevue+Neighborhood+Library", "WOODRIDGE%09Woodridge+Neighborhood+Library"]
audiences = ["ADULT%09Adults", "JUVENILE%09Children", "YOUNGADULT%09Teens"]
pubyears = ["2015"]
#,"2014"]

i=0
for f in formats:
    for a in audiences:
        for p in pubyears:
            for l in libraries:
                print i
                i=i+1
                html = scraperwiki.scrape("https://catalog.dclibrary.org/client/rss/hitlist/dcpl/qf=LIBRARY%09Library%091%3A"+l+"&qf=PUBDATE%09Publication+Date%09"+p+"%09"+p+"&qf=ITEMCAT2%09Audience%091%3A"+a+"&qf=FORMAT%09Bibliographic+Format%09"+f)
                root = lxml.html.fromstring(clean_xml(html))
                for entry in root.cssselect('feed entry'):
                    data = {
                        'title' : entry[0].text_content(),
                        'url' : entry.xpath('child::link/@href')[0],
                        'ils' : entry.xpath('child::ils/text()')[0],
                        'pub' : str(p),
                        'format' : re.sub(r'.*09',r'',str(f)),
                        'audience' : re.sub(r'.*09',r'',str(a)),
                        'date' : datetime.now()
                        }
                    #if not data['ils'] in ex_list:
                    scraperwiki.sql.save(unique_keys=['ils'], data=data)
        
