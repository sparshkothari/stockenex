from werkzeug.exceptions import abort
from werkzeug.utils import redirect
from flask import Blueprint, request, render_template, url_for, session, flash
from models import User
from werkzeug.wrappers.response import Response
from mongoengine import *
import json

home_bp = Blueprint('home_bp', __name__)


@home_bp.route('/', methods=['GET', 'POST'])
def index():
    return render_template("home/index.html")


@home_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template("home/register.html")
    elif request.method == 'POST':
        name = request.form["name"]
        username = request.form["username"]
        password = request.form["password"]
        email = request.form["email"]
        if User.objects(Q(username=username)):
            return Response(json.dumps([]), 400)
        u = User(name=name, username=username, password=password, email=email)
        u.save()
        userData = u.to_json()
        session["userData"] = userData
        session["logged_in"] = True
        return Response(userData, 200)


@home_bp.route('/about', methods=['GET'])
def about():
    return render_template("home/about.html")


@home_bp.route('/contact', methods=['GET'])
def contact():
    return render_template("home/contact.html")


@home_bp.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        u = User.objects(Q(username=request.form['username']) & Q(password=request.form['password'])).first()
        if not u:
            return Response(json.dumps([]), 401)
        else:
            session['logged_in'] = True
            userData = u.to_json()
            session["userData"] = userData
            #flash('You are logged in')
            return Response(userData, 200)
    return render_template('home/login.html')


@home_bp.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('home_bp.login'))
