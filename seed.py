from alexandria.colorMap.ColorMap import ColorMap
from mongoengine import *
from models import Stock
from smart_open import open

def fetchStocks():
    connect('stockenex')
    for line in open('s3://stockenex/stockData.csv'):
        lineInfo = line.split(',', 2)
        symbol = lineInfo[0]
        color = ColorMap().getColorHex(lineInfo[1].lower())
        value = lineInfo[2]
        if Stock.objects(Q(symbol=symbol)):
            i = Stock.objects(Q(symbol=symbol))
            i.delete()
        s = Stock(symbol=symbol, value=value, color=color)
        s.save()
    disconnect()
