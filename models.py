from mongoengine import Document, StringField, ListField, FloatField


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
    trend = StringField(default="no trend")
    slw = ListField(FloatField())
    enwl = ListField(FloatField())
    enwh = ListField(FloatField())
    exwl = ListField(FloatField())
    exwh = ListField(FloatField())
    close = ListField(FloatField())
    high = ListField(FloatField())
    low = ListField(FloatField())
