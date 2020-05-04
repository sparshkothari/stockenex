from mongoengine import *
from models import Stock
from smart_open import open
import json


def fetchStocks():
    connect('stockenex')
    with open('s3://stockenex/colorMap.json', 'r') as c:
        colorMap = json.load(c)[1]
    for i in range(1,3):
        for line in open('s3://stockenex/stockData' + str(i) + '.csv'):
            lineInfo = line.split(',', 2)
            symbol = lineInfo[0]
            color = lineInfo[1].lower()
            if color == "cyan":
                color = "cyan3"
            if color in colorMap.keys():
                color = colorMap[color]
            value = lineInfo[2]
            i = Stock(symbol=symbol)
            if Stock.objects(Q(symbol=symbol)):
                i = Stock.objects(Q(symbol=symbol)).first()
            i.value = value
            i.color = color

            v = i.value
            enw = v.split("Enw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            exw = v.split("Exw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            slw = v.split("Slw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            close = v.split("Close=")[1].split(" ")[0]

            i.enwl.append(float(enw.split("-")[0]))
            i.enwh.append(float(enw.split("-")[1]))

            i.exwl.append(float(exw.split("-")[0]))
            i.exwh.append(float(exw.split("-")[1]))

            i.slw.append(float(slw.split("-")[0]))
            #i.slwh.append(float(slw.split("-")[1]))

            i.close.append(float(close))
            i.save()
    disconnect()
