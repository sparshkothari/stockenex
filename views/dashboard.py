from werkzeug.exceptions import abort

from flask import Blueprint, request, render_template, session, url_for
from werkzeug.utils import redirect

from models import User, Stock
from werkzeug.wrappers.response import Response
from mongoengine import *
import json

dashboard_bp = Blueprint('dashboard_bp', __name__)


@dashboard_bp.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if "logged_in" not in session.keys() or not session["logged_in"]:
        return redirect(url_for('home_bp.login'))
    return render_template("dashboard/dashboard.html")


@dashboard_bp.route('/symbol', methods=['POST'])
def symbol():
    if not session["logged_in"]:
        abort(401)
    userData = json.loads(session["userData"])
    u = User.objects(Q(username=userData["username"]) & Q(password=userData["password"])).first()
    symbol_ = request.form["symbol"]
    operation = request.form["operation"]
    if operation == "add":
        u.symbols.append(symbol_)
    elif operation == "remove":
        u.symbols.remove(symbol_)
    u.save()
    userData = u.to_json()
    session["userData"] = userData
    return Response(userData, 200)


@dashboard_bp.route('/stock', methods=['GET'])
def stock():
    return Response(Stock.objects.to_json(), 200)
