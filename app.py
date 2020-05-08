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
app.session_interface = MongoEngineSessionInterface(db)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

CORS(app)
app.register_blueprint(home_bp)
app.register_blueprint(profile_bp)
