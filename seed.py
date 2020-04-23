from alexandria.colorMap.ColorMap import ColorMap
from mongoengine import *
from models import Stock
import os


def fetchStocks():
    connect('pyUser')
    fileName = os.getcwd() + "/assets/data/stockData.csv"
    with open(fileName, "r+") as CSVFile:
        for line in CSVFile.readlines():
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