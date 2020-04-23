from mongoengine import Document, StringField, ListField


class User(Document):
    name = StringField(default="Who really am I?")
    username = StringField(required=True)
    password = StringField(default="00")
    email = StringField(default="s@gmail.com")
    symbols = ListField(StringField())
    subscriptionType = StringField(default="Free Subscription")


class Stock(Document):
    symbol = StringField(required=True)
    value = StringField(default="no value")
    color = StringField(default="no color")