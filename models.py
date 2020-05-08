from mongoengine import Document, StringField, ListField, FloatField, EmailField


class User(Document):
    name = StringField(required=True)
    username = StringField(required=True)
    password = StringField(required=True)
    email = EmailField(required=True)
    symbols = ListField(StringField())
    subscriptionType = StringField(default="Free Subscription")


class Stock(Document):
    symbol = StringField(required=True)
    value = StringField(default="no value")
    color = StringField(default="no color")
    date = ListField(StringField())
    LS = StringField(default="")
    trend = StringField(default="no trend")
    slw = ListField(FloatField())
    enwl = ListField(FloatField())
    enwh = ListField(FloatField())
    exwl = ListField(FloatField())
    exwh = ListField(FloatField())
    close = ListField(FloatField())
    high = ListField(FloatField())
    low = ListField(FloatField())
