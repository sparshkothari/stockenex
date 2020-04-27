# app.py

from flask import Flask
from flask_cors import CORS
from flask_mongoengine import MongoEngine, MongoEngineSessionInterface

from views.home import home_bp
from views.profile import profile_bp

import sys

sys.dont_write_bytecode = True

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    "db": "stockenex",
}
db = MongoEngine(app)
app.session_interface = MongoEngineSessionInterface(db)#MongoDBSessionInterface(app, db, 'sessions')
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
# app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


# cache = Cache(app.server, config={
# 'CACHE_TYPE': 'simple'
# })

# cache.clear()

CORS(app)
app.register_blueprint(home_bp)
app.register_blueprint(profile_bp)
