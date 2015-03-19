#!/usr/bin/env python2
# -*- coding: utf-8 -*- #

from twitterbot import TwitterBot
import re, os, requests, logging

class MyTwitterBot(TwitterBot):
    def bot_init(self):
        """
        Initialize and configure your bot!
        Use this function to set options and initialize your own custom bot
        state (if any).
        """
        logging.warning("0")
        ############################
        # REQUIRED: LOGIN DETAILS! #
        ############################

        self.config['api_key'] = os.environ.get('API_KEY')
        self.config['api_secret'] = os.environ.get('API_SECRET')
        self.config['access_key'] = os.environ.get('ACCESS_KEY')
        self.config['access_secret'] = os.environ.get('ACCESS_SECRET')

        logging.warning("logged in")

        logging.warning(self.config['api_key'])
        logging.warning(type(self.config['api_key']))

        logging.warning(self.config['api_secret'])
        logging.warning(type(self.config['api_secret']))

        logging.warning(self.config['access_key'])
        logging.warning(type(self.config['access_key']))

        logging.warning(self.config['access_secret'])
        logging.warning(type(self.config['access_secret']))

        ######################################
        # SEMI-OPTIONAL: OTHER CONFIG STUFF! #
        ######################################

        # how often to tweet, in seconds
        self.config['tweet_interval'] = None    # default: 30 minutes

        # use this to define a (min, max) random range of how often to tweet
        # e.g., self.config['tweet_interval_range'] = (5*60, 10*60) # tweets every 5-10 minutes
        self.config['tweet_interval_range'] = None

        # only reply to tweets that specifically mention the bot
        self.config['reply_direct_mention_only'] = True

        # only include bot followers (and original tweeter) in @-replies
        self.config['reply_followers_only'] = True

        # fav any tweets that mention this bot?
        self.config['autofav_mentions'] = False

        # fav any tweets containing these keywords?
        self.config['autofav_keywords'] = []

        # follow back all followers?
        self.config['autofollow'] = False


        ###########################################
        # CUSTOM: your bot's own state variables! #
        ###########################################
        
        # If you'd like to save variables with the bot's state, use the
        # self.state dictionary. These will only be initialized if the bot is
        # not loading a previous saved state.

        # self.state['butt_counter'] = 0

        # You can also add custom functions that run at regular intervals
        # using self.register_custom_handler(function, interval).
        #
        # For instance, if your normal timeline tweet interval is every 30
        # minutes, but you'd also like to post something different every 24
        # hours, you would implement self.my_function and add the following
        # line here:
        
        # self.register_custom_handler(self.my_function, 60 * 60 * 24)


    def on_scheduled_tweet(self):
        """
        Make a public tweet to the bot's own timeline.
        It's up to you to ensure that it's less than 140 characters.
        Set tweet frequency in seconds with TWEET_INTERVAL in config.py.
        """
        # text = function_that_returns_a_string_goes_here()
        # self.post_tweet(text)
        logging.warning("1")
        pass
        

    def on_mention(self, tweet, prefix):
        """
        Defines actions to take when a mention is received.
        tweet - a tweepy.Status object. You can access the text with
        tweet.text
        prefix - the @-mentions for this reply. No need to include this in the
        reply string; it's provided so you can use it to make sure the value
        you return is within the 140 character limit with this.
        It's up to you to ensure that the prefix and tweet are less than 140
        characters.
        When calling post_tweet, you MUST include reply_to=tweet, or
        Twitter won't count it as a reply.
        """
 
        def search_dcpl(t):
            logging.warning("a")
            search = re.sub(r'^@kidsbooksfordc s:(.+)$',r'\1',t)
            search = re.sub(r' ',r'+',search)
            logging.warning("b")
            search_url = "http://catalog.dclibrary.org/client/en_US/dcpl/search/results?ln=en_US&rt=&qu="+search+"&qu=-%22sound+recording%22&te=&lm=BOOKS"
            logging.warning("c")
            r = requests.get(search_url)
            logging.warning("d")
            r_text = r.text
            logging.warning("e")
            ok = re.search(r'parseDetailAvailabilityJSON',r_text)
            logging.warning(ok)
            logging.warning("f")
            if ok != None:
                return "Found: "+search_url
            elif re.search(r'This search returned no results',r_text):
                return "Not found"
            else:
                return "Possible match: "+search_url

        logging.warning("2")
        text = tweet.text
        logging.warning(re.search(r's:.+',text))
        if re.search(r's:.+',text)!=None:
            logging.warning("yay")
            try:
                reply = search_dcpl(text)
                self.post_tweet(prefix + ' ' + reply, reply_to=tweet)
            except:
                self.post_tweet(prefix + ' Not found', reply_to=tweet)                
        else:
            logging.warning("boo")
            pass



    def on_timeline(self, tweet, prefix):
        """
        Defines actions to take on a timeline tweet.
        tweet - a tweepy.Status object. You can access the text with
        tweet.text
        prefix - the @-mentions for this reply. No need to include this in the
        reply string; it's provided so you can use it to make sure the value
        you return is within the 140 character limit with this.
        It's up to you to ensure that the prefix and tweet are less than 140
        characters.
        When calling post_tweet, you MUST include reply_to=tweet, or
        Twitter won't count it as a reply.
        """
        # text = function_that_returns_a_string_goes_here()
        # prefixed_text = prefix + ' ' + text
        # self.post_tweet(prefix + ' ' + text, reply_to=tweet)

        # call this to fav the tweet!
        # if something:
        #     self.favorite_tweet(tweet)
        logging.warning("3")
        pass


if __name__ == '__main__':
    logging.warning("4")
    bot = MyTwitterBot()
    logging.warning("5")
    bot.run()
    logging.warning("6")
