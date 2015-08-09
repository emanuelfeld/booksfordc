#!/usr/bin/env python

import scraperwiki
import lxml.html
import datetime
import time
import re

base = "https://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu="

def clean(x):
    return re.sub(r'\D',r'',x)

tries = 0

while tries < 4:
    try:
        html = scraperwiki.scrape(base)
        root = lxml.html.fromstring(html)
        count = {
            'date' : str(datetime.date.today()),
            'count' : int(clean(root.cssselect(".resultsToolbar_num_results")[0].text_content()))
            }
        scraperwiki.sql.save(unique_keys=['date'], data=count,table_name="libcount")
        break
    except:
        time.sleep(30)
        tries += 1
