#!/usr/bin/env python2
# -*- coding: utf-8 -*- #

from twitterbot import TwitterBot
from datetime import datetime
import cssselect, logging, lxml.html, os, re, requests, time

logging.basicConfig(level=logging.INFO)

class MyTwitterBot(TwitterBot):

    def bot_init(self):
        logging.warning("Initializing bot")
        ############################
        # REQUIRED: LOGIN DETAILS! #
        ############################

        self.config['api_key'] = os.environ.get('API_KEY')
        self.config['api_secret'] = os.environ.get('API_SECRET')
        self.config['access_key'] = os.environ.get('ACCESS_KEY')
        self.config['access_secret'] = os.environ.get('ACCESS_SECRET')

        logging.warning("Logging in")

        ######################################
        # SEMI-OPTIONAL: OTHER CONFIG STUFF! #
        ######################################

        self.config['reply_interval'] = 5*60

        # only reply to tweets that specifically mention the bot
        self.config['reply_direct_mention_only'] = True

        # only include bot followers (and original tweeter) in @-replies
        self.config['reply_followers_only'] = False

        # fav any tweets that mention this bot?
        self.config['autofav_mentions'] = False

        # fav any tweets containing these keywords?
        self.config['autofav_keywords'] = []

        # follow back all followers?
        self.config['autofollow'] = False

    def on_scheduled_tweet(self):
        pass
        
        
    def on_mention(self, tweet, prefix):

        def search_sirsi(s):
            logging.warning("Valid: True")
            search_url = "http://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu="+"f: redshirts john scalzi"+"&qu=-%22sound+recording%22&te=&lm=BOOKS"
            logging.warning("Query URL: "+search_url)
            response = requests.get(search_url, allow_redirects=True)
            logging.warning("Response URL: "+response.url)
            r_text = response.text
            ok = re.search(r'parseDetailAvailabilityJSON', r_text)
            if ok != None:
                logging.warning("Outcome: Book found")
                return "Found: " + response.url
            elif re.search(r'This search returned no results', r_text):
                logging.warning("Outcome: Book not found")
                return "Not found: " + response.url
            else:
                logging.warning("Outcome: Possible match")
                return "Possible match: " + response.url
            
        def search_overdrive(s):
            logging.warning("Valid: True")
            search_url = "http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria="+s+"&x=0&y=0&Format=420%2C50%2C410%2C450%2C610%2C810%2C303"
            logging.warning("Query URL: "+search_url)
            response = requests.get(search_url, allow_redirects=True)
            root = lxml.html.fromstring(response.content)
            matches = len(root.cssselect(".tc-title"))
            if matches == 1:
                logging.warning("Outcome: eBook found")
                return "Found: " + search_url
            elif matches ==0:
                logging.warning("Outcome: eBook not found")
                return "Not found: " + search_url
            else:
                logging.warning("Outcome: Possible match")
                return "Possible match: " + search_url

        def search_audio(s):
            logging.warning("Valid: True")
            search_url = "http://overdrive.dclibrary.org/BANGSearch.dll?Type=FullText&PerPage=24&URL=SearchResults.htm&Sort=SortBy%3DRelevancy&FullTextField=All&FullTextCriteria="+s+"&x=0&y=0&Format=425"
            logging.warning("Query URL: "+search_url)
            response = requests.get(search_url, allow_redirects=True)
            root = lxml.html.fromstring(response.content)
            matches = len(root.cssselect(".tc-title"))
            if matches == 1:
                logging.warning("Outcome: Audiobook found")
                return "Found: " + search_url
            elif matches ==0:
                logging.warning("Outcome: Audiobook not found")
                return "Not found: " + search_url
            else:
                logging.warning("Outcome: Possible match")
                return "Possible match: " + search_url
        
        def search_dcpl(t):
            search = re.sub(r'^(\.?)@booksfordc( audiobook | audio-book | audio | a-bk | abk | a | e\-book | e\-bk | ebook | ebk | e | book | bk | b |[ ]?)(search:|s:|find:|f:|search |s |find |f )(.+)$', r'\4', t)
            cat = re.sub(r'^(\.?)@booksfordc( audiobook | audio-book | audio | a-bk | abk | a | e\-book | e\-bk | ebook | ebk | e | book | bk | b |[ ]?)(search:|s:|find:|f:|search |s |find |f )(.+)$', r'\2', t)
            search = re.sub(r' ', r'+', search)
            if cat in [' e ',' ebk ',' ebook ',' e-bk ',' e-book ']:
                return search_overdrive(search)
            elif cat in [' a ',' abk ',' audio ',' audiobook ',' a-bk ',' audio-book ']:
                return search_audio(search)
            else:
                return search_sirsi(search)
        
        text = tweet.text
        logging.warning(text)
        
        if re.search(r'^(\.?)@booksfordc( audiobook | audio-book | audio | a-bk | abk | a | e\-book | e\-bk | ebook | ebk | e | book | bk | b |[ ]?)(search:|s:|find:|f:|search |s |find |f ).+', text) != None:
            now = datetime.now()
            created = tweet.created_at
            day_delta = (datetime.now() - tweet.created_at).days
            second_delta = (datetime.now() - tweet.created_at).seconds
            if day_delta == 0 and second_delta < 3600:
                # try:
                logging.warning("User: " + str(prefix))
                logging.warning("Current time: " + str(now) + "; Created time: " + str(created) + "; Difference (d): " + str(day_delta) + "; Difference (s): " + str(second_delta))
                reply = search_dcpl(text)
                self.post_tweet(prefix + ' ' + reply, reply_to=tweet)
                time.sleep(70)
                # except:
                #     logging.warning("Outcome: Failed search")
                #     time.sleep(70)
                #     pass
            else:
                logging.warning("Valid: Old mention")
                time.sleep(70)
                pass
        else:
            logging.warning("Valid: False")
            time.sleep(70)
            pass

    def on_timeline(self, tweet, prefix):
        pass


if __name__ == '__main__':
    bot = MyTwitterBot()
    bot.run()
