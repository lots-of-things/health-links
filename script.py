import webapp2, urllib, json, pickle
#import pandas as pd
from google.appengine.ext import ndb

DEFAULT_SYMPTOMSLOG_NAME = 'forum_data'

def SYMPTOMSLOG_key(SYMPTOMSLOG_name=DEFAULT_SYMPTOMSLOG_NAME):
    """Constructs a Datastore key for a SYMPTOMSLOG entity.

    We use SYMPTOMSLOG_name as the key.
    """
    return ndb.Key('SYMPTOMSLOG', SYMPTOMSLOG_name)


class SymptomDescription(ndb.Model):
    """A main model for representing an individual SYMPTOMSLOG entry."""
    content = ndb.StringProperty(indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)



def findDiagnosis(text):
    tfidf=vectorizer.transform([text])
    diag=clf.predict_proba(tfidf)
    return 'some text'

class QuerySymptoms(webapp2.RequestHandler):

    def get(self):
        pass

    def post(self):
        # We set the same parent key on the 'SymptomDescription' to ensure each
        # SymptomDescription is in the same entity group. Queries across the
        # single entity group will be consistent. However, the write
        # rate to a single entity group should be limited to
        # ~1/second.
        SYMPTOMSLOG_name = DEFAULT_SYMPTOMSLOG_NAME
        symptom = SymptomDescription(parent=SYMPTOMSLOG_key(SYMPTOMSLOG_name))

        symptom.content = self.request.get('content')
        symptom.put()
        diag=findDiagnosis(symptom.content)
        obj = {'todisplay': [{'link':'http://www.purple.com', 'question':'I have some symptoms that involve some bumps and some red rashes.'},{'link':'http://www.makeloft.org', 'question':'I have some pink spots on my left arm.'}]}
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(obj))

vectorizer = pickle.load(open("forum_vectorizer.pkl", "rb" ) )
clf=pickle.load(open("forum_classifier.pkl", "rb" ) )

app = webapp2.WSGIApplication([
    ('/symptoms', QuerySymptoms)
], debug=True)
