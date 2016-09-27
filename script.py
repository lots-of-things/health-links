import webapp2, urllib, json
import os, jinja2
#import pandas as pd
from google.appengine.ext import ndb

DEFAULT_SYMPTOMSLOG_NAME = 'forum_data'

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def SYMPTOMSLOG_key(SYMPTOMSLOG_name=DEFAULT_SYMPTOMSLOG_NAME):
    """Constructs a Datastore key for a SYMPTOMSLOG entity.

    We use SYMPTOMSLOG_name as the key.
    """
    return ndb.Key('SYMPTOMSLOG', SYMPTOMSLOG_name)


class SymptomDescription(ndb.Model):
    """A main model for representing an individual SYMPTOMSLOG entry."""
    content = ndb.StringProperty(indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)

class GetConditions(webapp2.RequestHandler):

    def get(self):
        pass

    def post(self):
        # SYMPTOMSLOG_name = DEFAULT_SYMPTOMSLOG_NAME
        # symptom = SymptomDescription(parent=SYMPTOMSLOG_key(SYMPTOMSLOG_name))
        #
        content = self.request.get('content')
        # symptom.put()
        resp = urllib.urlopen("http://ec2-54-208-15-210.compute-1.amazonaws.com/linkhealth/api/v1.0/conditions/"+content)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(json.loads(resp.read())))

class GetStatistics(webapp2.RequestHandler):

    def get(self):
        pass

    def post(self):
        # SYMPTOMSLOG_name = DEFAULT_SYMPTOMSLOG_NAME
        # symptom = SymptomDescription(parent=SYMPTOMSLOG_key(SYMPTOMSLOG_name))
        #
        condition = self.request.get('condition')
        # symptom.put()
        resp = urllib.urlopen("http://ec2-54-208-15-210.compute-1.amazonaws.com/linkhealth/api/v1.0/statistics/"+condition)
        d = json.loads(resp.read())


        template = JINJA_ENVIRONMENT.get_template('html/condition_cards.html')
        self.response.write(template.render(d))

class GetExperiences(webapp2.RequestHandler):

    def get(self):
        pass

    def post(self):
        # SYMPTOMSLOG_name = DEFAULT_SYMPTOMSLOG_NAME
        # symptom = SymptomDescription(parent=SYMPTOMSLOG_key(SYMPTOMSLOG_name))
        #
        # symptom.content = self.request.get('content')
        # symptom.put()
        content = self.request.get('content')
        condition = self.request.get('condition')
        resp = urllib.urlopen("http://ec2-54-208-15-210.compute-1.amazonaws.com/linkhealth/api/v1.0/experiences/"+content+"?condition="+condition)
        d = json.loads(resp.read())
        template_values = {
            'items': d['sim_exp']
        }

        template = JINJA_ENVIRONMENT.get_template('html/forum_template.html')
        self.response.write(template.render(template_values))
        #self.response.write(d)

app = webapp2.WSGIApplication([
    ('/experiences', GetExperiences),
    ('/statistics', GetStatistics),
    ('/symptoms', GetConditions)
], debug=True)
