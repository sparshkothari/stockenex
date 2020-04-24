from mongoengine import *
from models import Stock
from smart_open import open
import json

def fetchStocks():
    connect('stockenex')
    with open('s3://stockenex/colorMap.json', 'r') as c:
    	colorMap = json.load(c)[1]

    for line in open('s3://stockenex/stockData.csv'):
        lineInfo = line.split(',', 2)
        symbol = lineInfo[0]
        color = lineInfo[1].lower()
        if color in colorMap.keys():
        	color = colorMap[color]
    	value = lineInfo[2]
        if Stock.objects(Q(symbol=symbol)):
            i = Stock.objects(Q(symbol=symbol))
            i.delete()
        s = Stock(symbol=symbol, value=value, color=color)
        s.save()
    disconnect()
