from mongoengine import *
from models import Stock
from smart_open import open
import json


def fetchStocks():
    connect('stockenex')
    with open('s3://stockenex/colorMap.json', 'r') as c:
        colorMap = json.load(c)[1]
    with open('s3://stockenex/stockDataFileCount.txt') as fc:
        fileCount = int(fc.readline())

    Stock.objects.delete()
    for i in range(1, fileCount + 1):
        date = ""
        for line in open('s3://stockenex/stockData' + str(i) + '.csv'):
            if ('Symbol,"S, D","S, D"' in line or "Trade in Profit Range" in line):
                continue
            if "Date" in line:
                date = line.split(",")[1] #Date ,2020-05-06,
                continue
            lineInfo = line.split(',', 2)
            symbol = lineInfo[0]
            color = lineInfo[1].lower()
            if color == "cyan":
                color = "cyan3"
            if color in colorMap.keys():
                color = colorMap[color]
            value = lineInfo[2]

            st = Stock(symbol=symbol)
            if Stock.objects(Q(symbol=symbol)):
                st = Stock.objects(Q(symbol=symbol)).first()

            if color == "#FCE883":
                st.slw = []
                st.enwl = []
                st.enwh = []
                st.exwl = []
                st.exwh = []
                st.close = []
                st.high = []
                st.low = []
                st.date = []

            v = value

            LS = v.split(" ")[0]
            trend = v.split(" [ Enw=")[0].split('(')[1]
            enw = v.split("Enw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            exw = v.split("Exw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            if i > 3:
                slw = v.split("Slw= ")[1].split("]")[0]
            else:
                slw = v.split("Slw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            close = v.split("Close=")[1].split(" ")[0]
            high = v.split("High=")[1].split(" ")[0]
            low = v.split("Low=")[1].split(" ")[0]

            st.value = v
            st.color = color
            st.trend = trend
            st.LS = LS
            st.date.append(date)
            st.enwl.append(float(enw.split("-")[0]))
            st.enwh.append(float(enw.split("-")[1]))

            st.exwl.append(float(exw.split("-")[0]))
            st.exwh.append(float(exw.split("-")[1]))
            if i > 3:
                st.slw.append(float(slw))
            else:
                st.slw.append(float(slw.split("-")[0]))

            st.close.append(float(close))
            st.high.append(float(high))
            st.low.append(float(low))
            st.save()
    disconnect()
