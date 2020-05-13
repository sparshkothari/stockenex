define(function() {
    ProfileBase.init()
});

var ProfileBase = {

    init: function() {
        $.get("/user")
            .done(function(data, status) {
                if (typeof(data) == "string") {
                    data = data;
                } else {
                    data = JSON.stringify(data, null, 2);
                }
                localStorage.setItem("userData", data); //JSON.stringify(data, null, 2))
                ProfileBase.profile.init()
                ProfileBase.subscrip.init()
                ProfileBase.stockColorKey.init("stockColorKey")
                ProfileBase.dashboard.init()
            });

    },


    profile: {
        init: function() {
            this.profileTabulator()
        },
        profileTabulator: function() {
            let userData = JSON.parse(String(localStorage.getItem("userData")))
            let uatData = []
            let uatColumns = [{
                    title: "Item",
                    field: "Item",
                    align: "center",
                    width: 200,
                    formatter: function(cell) {
                        cell.getElement().style.height = "25px"
                        return cell.getValue()
                    },
                },
                {
                    title: "Value",
                    field: "Value",
                    align: "center",
                    formatter: function(cell) {
                        cell.getElement().style.height = "25px"
                        return cell.getValue()
                    },
                    width: 300,
                    variableHeight: true
                },
            ]
            for (let e of Object.keys(userData)) {
                let i = new Object()
                if (e != "_id" && e != "symbols" && userData[e]) {
                    i.Item = e
                    i.Value = userData[e].toString()
                    uatData.push(i);
                }
            }
            var UserAT = new Tabulator("#userAT", {
                tooltips: function(cell) {
                    return cell.getValue();
                },
                height: "157px",
                data: uatData,
                layout: "fitColumns",
                rowFormatter: function(row) {
                    row.getElement().style.backgroundColor = "#87ff5f";
                },
                columns: uatColumns,
            });
        }
    },

    subscrip: {

        init: function() {
            let freeS_b = document.getElementById('freeS');
            let basicS_b = document.getElementById('basicS');
            let premiumS_b = document.getElementById('premiumS');
            let platinumS_b = document.getElementById('platinumS');
            freeS_b.addEventListener("click", function() {
                ProfileBase.subscrip.upgradeSubscriptionOP("Free Subscription")
            }, false);
            basicS_b.addEventListener("click", function() {
                ProfileBase.subscrip.upgradeSubscriptionOP("Basic Subscription")
            }, false);
            premiumS_b.addEventListener("click", function() {
                ProfileBase.subscrip.upgradeSubscriptionOP("Premium Subscription")
            }, false);
            platinumS_b.addEventListener("click", function() {
                ProfileBase.subscrip.upgradeSubscriptionOP("Platinum Subscription")
            }, false);
        },
        upgradeSubscriptionOP: function(subscriptionType) {
            this.subscriptionHandler(subscriptionType);
        },

        subscriptionHandler: function(subscriptionType) {
            if (!confirm("Are you sure you want to modify or upgrade your subscription?")) {
                return;
            }
            $.post("/subscription", {
                    subscriptionType: subscriptionType
                })
                .done(function(data, status) {
                    localStorage.setItem("userData", data);
                    ProfileBase.profile.profileTabulator()
                });
        }
    },

    dashboard: {

        init: function() {
            $.get("/isMobile")
                .done(function(data, status) {
                    if (typeof(data) == "string") {
                        data = JSON.parse(data);
                    }
                    ProfileBase.dashboard.dashboardStocks(data["isMobile"]);
                    ProfileBase.dashboard.dashboardProfile();
                    //ProfileBase.dashboard.dashCharts();
                    ProfileBase.dashboard.generateStockList();
                    ProfileBase.dashboard.addEventListeners();
                });


        },

        dashboardStocksTabulator: function(data, isMobile) {

            let legendCMap = function() {
                let i = ProfileBase.stockColorKey.returnColorKey();

                this.returnColor = function(value) {
                    return i.find(element => element["value"] == value)["color"];
                }

                this.returnValue = function(color) {
                    return i.find(element => element["color"] == color.toUpperCase())["value"];
                }

            }

            var uniqueColors = data.reduce(function(a, b) {
                if (a[b['color']]) {
                    a[b['color']].push({ value: b['value'], symbol: b['symbol'] })
                } else {
                    a[b['color']] = [{ value: b['value'], symbol: b['symbol'] }]
                }
                return a
            }, {});

            let y = Object.values(uniqueColors).map(function(a) { return a.length; }).indexOf(Math.max.apply(Math, Object.values(uniqueColors).map(function(a) { return a.length; })));
            let maxColumnIndex = Object.keys(uniqueColors).length
            let maxRowIndex = Object.values(uniqueColors)[y].length
            var tabData = []
            var tabColumns = []
            if (isMobile) {
                for (let color of Object.keys(uniqueColors)) {
                    for (let k = 0; k < uniqueColors[color].length; k++) {
                        let row = new Object()
                        row["symbol"] = uniqueColors[color][k]["symbol"]
                        row["color"] = color
                        tabData.push(row);
                    }
                }
                tabColumns.push({
                    title: "color",
                    field: "color",
                    align: "center",
                    visible: false
                });
                tabColumns.push({
                    title: "symbol",
                    field: "symbol",
                    align: "center",
                    formatter: function(cell, formatterParams, onRendered) {
                        if (cell.getValue()) {
                            c = cell.getRow().getData().color;//cell.getRow().getCell("color").getValue();
                            cell.getElement().style.backgroundColor = c;
                            if (ProfileBase.stockColorKey.returnColorWhiteTextArray().includes(c.toUpperCase())) {
                                cell.getElement().style.color = "white";
                            }
                        } else {
                            cell.getElement().style.backgroundColor = "black";
                        }
                        return cell.getValue();
                    }
                });

                var CCT = new Tabulator("#dashboardStocksTabulator", {
                    //headerVisible:false,
                    height: "100%",
                    data: tabData,
                    layout: "fitColumns",
                    columns: tabColumns,
                });
                CCT.redraw()

            } else {

                for (let i = 0; i < maxRowIndex; i++) {
                    let row = new Object()
                    for (let color of Object.keys(uniqueColors)) {
                        if (uniqueColors[color].length > i) {
                            row[color] = uniqueColors[color][i]["symbol"]
                        } else {
                            row[color] = ""
                        }
                    }
                    tabData.push(row)
                }

                for (let color of Object.keys(uniqueColors)) {
                    tabColumns.push({
                        title: new legendCMap().returnValue(color),
                        field: color,
                        align: "center",
                        formatter: function(cell, formatterParams, onRendered) {
                            if (cell.getValue()) {
                                cell.getElement().style.backgroundColor = color;
                                if (ProfileBase.stockColorKey.returnColorWhiteTextArray().includes(color.toUpperCase())) {
                                    cell.getElement().style.color = "white";
                                }
                            } else {
                                cell.getElement().style.backgroundColor = "black";
                            }
                            return cell.getValue();
                        }
                    })
                }
                var CCT = new Tabulator("#dashboardStocksTabulator", {
                    //headerVisible:false,
                    height: "100%",
                    data: tabData,
                    layout: "fitColumns",
                    columns: tabColumns,
                });
                CCT.redraw()

            }
        },

        dashboardProfile: function() {
            let userData = JSON.parse(String(localStorage.getItem("userData")))
            let symbols = userData["symbols"]

            let ustColumns = [{
                    title: "Value",
                    field: "value",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "slw",
                    field: "slw",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "enwl",
                    field: "enwl",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "enwh",
                    field: "enwh",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "exwl",
                    field: "exwl",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "exwh",
                    field: "exwh",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "high",
                    field: "high",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "low",
                    field: "low",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "close",
                    field: "close",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },
                {
                    title: "date",
                    field: "date",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                }, {
                    title: "LS",
                    field: "LS",
                    align: "center",
                    formatter: "textarea",
                    visible: false
                },

                {
                    title: "",
                    field: "viewGraph",
                    align: "center",
                    formatter: "textarea",
                    width: 50,
                    cellClick: function(e, cell) {
                        let z = document.getElementById("IndividualDashboard");
                        z.innerHTML = "";
                        let y = document.createElement('div');
                        y.id = "individualChart";
                        y.classList.add("w3-animate-opacity");
                        y.style = "text-align:center; animation-duration:3s; width:70%; height: 600px; margin-left: auto; margin-right: auto";
                        z.appendChild(y);
                        let sy = cell.getRow().getCell("symbol").getValue();
                        let val = cell.getRow().getCell("value").getValue();

                        let trend = cell.getRow().getCell("trend").getValue();
                        let slw = cell.getRow().getCell("slw").getValue();
                        let enwl = cell.getRow().getCell("enwl").getValue();
                        let enwh = cell.getRow().getCell("enwh").getValue();
                        let exwl = cell.getRow().getCell("exwl").getValue();
                        let exwh = cell.getRow().getCell("exwh").getValue();
                        let close = cell.getRow().getCell("close").getValue();
                        let low = cell.getRow().getCell("low").getValue();
                        let high = cell.getRow().getCell("high").getValue();
                        let date = cell.getRow().getCell("date").getValue();
                        let LS = cell.getRow().getCell("LS").getValue();

                        let item = new Object();
                        item["symbol"] = sy;
                        item["value"] = val;
                        item["trend"] = trend;
                        item["slw"] = slw;
                        item["enwl"] = enwl;
                        item["enwh"] = enwh;
                        item["exwl"] = exwl;
                        item["exwh"] = exwh;
                        item["close"] = close;
                        item["low"] = low;
                        item["high"] = high;
                        item["date"] = date;
                        item["LS"] = LS;
                        let tr = [];
                        let obj = ProfileBase.dashboard.getDashObject(item);
                        tr.push(obj);
                        ProfileBase.dashboard.rangeAreaChart(tr, "individualChart")
                        openDTab("IndividualDashboard")
                    }
                },
                /*
1st column—trend—LCB/LB/
2nd column-ENW
3rd column-EXW
4th column-SLW
5th column-close
6th column-high/low
*/
                {
                    title: "symbol",
                    field: "symbol",
                    align: "center",
                    width: 75
                },
                {
                    title: "trend",
                    field: "trend",
                    align: "middle",
                    width: 75
                },
                {
                    title: "enw",
                    field: "enw",
                    align: "center",
                    formatter: "textarea"
                },
                {
                    title: "exw",
                    field: "exw",
                    align: "center",
                    formatter: "textarea"
                },
                {
                    title: "slw",
                    field: "slwLast",
                    align: "center",
                    formatter: "textarea"
                },
                {
                    title: "close",
                    field: "closeLast",
                    align: "center",
                    formatter: "textarea"
                },
                {
                    title: "low—high",
                    field: "lowHigh",
                    align: "center",
                    formatter: "textarea"
                }

            ]
            let ustData = []
            $.get("/stock")
                .done(function(data, status) {
                    let data_;
                    if (typeof(data) == "string") {
                        data_ = JSON.parse(data);
                    } else {
                        data_ = data;
                    }
                    for (let item of data_) {
                        if (symbols.includes(item["symbol"])) {
                            let u = new Object()
                            u.symbol = item["symbol"];
                            u.value = item["value"];
                            u.trend = item["trend"];
                            u.slw = item["slw"];
                            u.enwl = item["enwl"];
                            u.enwh = item["enwh"];
                            u.exwl = item["exwl"];
                            u.exwh = item["exwh"];
                            u.close = item["close"];
                            u.high = item["high"];
                            u.low = item["low"];
                            u.date = item["date"];
                            u.LS = item["LS"];
                            u.slwLast = u.slw.slice(-1)[0]
                            u.closeLast = u.close.slice(-1)[0]
                            u.lowHigh = u.low.slice(-1)[0] + "—" + u.high.slice(-1)[0]
                            u.enw = u.enwl.slice(-1)[0] + "—" + u.enwh.slice(-1)[0]
                            u.exw = u.exwl.slice(-1)[0] + "—" + u.exwh.slice(-1)[0]
                            u.viewGraph = "View Graph";

                            ustData.push(u)
                        }
                    }
                    var UserST = new Tabulator("#userST", {
                        tooltips: function(cell) {
                            return cell.getValue();
                        },
                        height: "100%",
                        data: ustData,
                        layout: "fitColumns",
                        rowFormatter: function(row) {
                            let val = row.getCell("value").getValue();
                            let c = data_.find(element => element["value"] == val)["color"].toUpperCase();
                            row.getElement().style.backgroundColor = c;
                            if (ProfileBase.stockColorKey.returnColorWhiteTextArray().includes(c.toUpperCase())) {
                                row.getElement().style.color = "white";
                            }
                        },
                        columns: ustColumns,
                    });
                    UserST.redraw()
                });
        },

        dashboardStocks: function(isMobile) {
            $.get("/stock")
                .done(function(data, status) {
                    let data_;
                    if (typeof(data) == "string") {
                        data_ = JSON.parse(data);
                    } else {
                        data_ = data;
                    }
                    ProfileBase.dashboard.dashboardStocksTabulator(data_, isMobile);
                });
        },

        rangeAreaChart: function(data_, divName) {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create(divName, am4charts.XYChart);
            chart.hiddenState.properties.opacity = 0; // this creates initial fade-in


            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.dateFormats.setKey("day", "MMMM dt");

            let data = []
            let data__ = data_[0]

            for (let i = 0, j = data__["slw"].length - 1; i < data__["slw"].length, j > -1; i++, j--) {
                let da = new Date()
                let dataDa = data__.date[i].split("-") //2020-05-06
                da.setDate(dataDa[2])
                da.setMonth(dataDa[1] - 1)
                da.setYear(dataDa[0])

                if (data__["slw"].length == 1) {
                    da__ = new Date(da)
                    da__.setHours(4)
                    da.setHours(3)
                    dateAxis.baseInterval = {
                        "timeUnit": "hour",
                        "count": 1
                    }
                    dateAxis.dateFormats.setKey("hour", "MMMM dt");
                    data.push({
                        date: da__,
                        slw: data__.slw[i],
                        enwl: data__.enwl[i],
                        enwh: data__.enwh[i],
                        exwl: data__.exwl[i],
                        exwh: data__.exwh[i],
                        close: data__.close[i],
                        high: data__.high[i],
                        low: data__.low[i]
                    });

                }
                data.push({
                    date: da,
                    slw: data__.slw[i],
                    enwl: data__.enwl[i],
                    enwh: data__.enwh[i],
                    exwl: data__.exwl[i],
                    exwh: data__.exwh[i],
                    close: data__.close[i],
                    high: data__.high[i],
                    low: data__.low[i]
                });
            }

            var title = chart.titles.create();
            title.text = data__["symbol"] + "\n" + "trend: " + data__["trend"];
            if (data__["color"] == "#F664AF") {
                title.text += "\nComment: Trade in Profit Range"
            } else if (data__["color"] == "#FCE883") {
                title.text += "\nComment: Trend Change"
            } else if (data__["color"] == "#00FF00") {
                title.text += "\nComment: Entry Day"
            } else if (data__["color"] == "#EE204D") {
                title.text += "\nComment: No Entry for Trade"
            }

            chart.data = data;



            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;

            function createSeries(field, openField, name, color, strokeColor) {
                var series = chart.series.push(new am4charts.LineSeries());

                series.dataFields.dateX = "date";
                series.dataFields.openValueY = openField;
                series.dataFields.valueY = field;
                series.name = name
                series.sequencedInterpolation = true;
                series.fillOpacity = 0.3;
                series.fill = am4core.color(color)
                series.defaultState.transitionDuration = 1000;
                series.tensionX = 0.8;
                series.tooltipText = "[b]{valueY}[/]";
                series.stroke = am4core.color(strokeColor);

                // Set up tooltip
                series.adapter.add("tooltipText", function(ev) {
                    var text = "";
                    chart.series.each(function(item) {
                        text += "[" + item.stroke.hex + "]●[/] " + item.name + ": {" + item.dataFields.valueY + "}\n";
                    });
                    return text;
                });

                series.tooltip.getFillFromObject = false;
                series.tooltip.background.fill = am4core.color("#fff");
                series.tooltip.label.fill = am4core.color("#00");

                if (name == "close") {
                    series.fillOpacity = 0;
                    series.tensionX = 1;
                    //series.strokeDasharray = [5]
                    series.strokeWidth = 5
                } else if (name == "high") {
                    series.fillOpacity = 0;
                    series.tensionX = 1;
                    series.strokeDasharray = [5]
                    series.strokeWidth = 5
                } else if (name == "low") {
                    series.fillOpacity = 0;
                    series.tensionX = 1;
                    series.strokeDasharray = [10]
                    series.strokeWidth = 5
                }
                var bullet = series.bullets.push(new am4charts.CircleBullet());
                bullet.circle.stroke = am4core.color("#fff");
                bullet.circle.strokeWidth = 2;
                bullet.circle.fill = series.stroke

                return series;

            }

            createSeries("close", null, "close", null, "#000000")
            createSeries("high", null, "high", null, "#800080")
            createSeries("low", null, "low", null, "#00FF00")

            if (data__["LS"] == "L") {
                createSeries("exwh", "exwl", "exwh", "#F664AF", "#F664AF")
                createSeries("exwl", "enwh", "exwl", "#FFA500", "#F664AF")
                createSeries("enwh", "enwl", "enwh", "#005f00", "#005f00")
                createSeries("enwl", "slw", "enwl", "#EE204D", "#005f00")
                createSeries("slw", null, "slw", "#FFFFFF", "#EE204D")
            } else if (data__["LS"] == "S") {
                createSeries("slw", "enwl", "slw", "#EE204D", "#EE204D")
                createSeries("enwl", "enwh", "enwl", "#005f00", "#005f00")
                createSeries("enwh", "exwl", "enwh", "#FFA500", "#005f00")
                createSeries("exwl", "exwh", "exwl", "#F664AF", "#F664AF")
                createSeries("exwh", null, "exwh", "#FFFFFF", "#F664AF")
            }


            chart.cursor = new am4charts.XYCursor();
            chart.cursor.xAxis = dateAxis;
            chart.scrollbarX = new am4core.Scrollbar();
            chart.cursor.maxTooltipDistance = 0;

            chart.legend = new am4charts.Legend();

        },


        dashCharts: function() {
            let symbols = JSON.parse(localStorage.getItem("userData"))["symbols"]
            var dashDivElementNameArray = this.createDashDivElements(symbols);
            $.get("/stock")
                .done(function(data, status) {
                    let i = 0;
                    if (typeof(data) == "string") {
                        data = JSON.parse(data);
                    } else {
                        data = data;
                    }
                    for (let item of data) {
                        if (symbols.includes(item["symbol"])) {
                            let u = ProfileBase.dashboard.getDashObject(item)
                            let tr = []
                            tr.push(u)
                            ProfileBase.dashboard.rangeAreaChart(tr, "dashDivCol" + u.symbol)
                            i = i + 1
                        }
                    }
                });
        },

        getDashObject: function(item) {
            return item;
        },


        createDashDivElements: function(symbols) {
            let length = symbols.length
            let o = [];
            let columnCount = 2;
            let cellCount = length;
            let dash = document.getElementById("dashRows");
            dash.innerHTML = "";
            for (let i = 0; i < cellCount; i = i + columnCount) {

                if (i % columnCount == 0) {
                    let y = document.createElement("div");
                    let divRowName = "dashDivRow" + i;
                    y.id = divRowName;
                    y.classList = "w3-row";
                    dash.appendChild(y);

                    for (let j = 0; j < columnCount; j++) {
                        let u = document.createElement("div");
                        u.classList = "w3-col s" + 12 / columnCount + " w3-center";

                        let divColName;
                        if ((i + j) < cellCount) {
                            divColName = "dashDivCol" + symbols[i + j];
                        } else {
                            divColName = "dashDivCol" + (i + j);

                        }
                        u.id = divColName;
                        u.style.height = "600px"
                        y.appendChild(u);
                        o.push(divColName);

                    }
                }
            }
            return o;
        },

        generateStockList: function() {
            let symbols = JSON.parse(localStorage.getItem("userData"))["symbols"]
            $.get("/stock")
                .done(function(data, status) {
                    if (typeof(data) == "string") {
                        data = JSON.parse(data);
                    } else {
                        data = data;
                    }
                    let dashboardSel = document.getElementById("dashboardList")
                    let addSel = document.getElementById("addStockList");
                    let removeSel = document.getElementById("removeStockList");
                    addSel.innerHTML = "";
                    removeSel.innerHTML = "";
                    dashboardSel.innerHTML = '<option value="">Select Graph</option>';
                    for (let el of data) {

                        if (!symbols.includes(el["symbol"])) {
                            sOpt = document.createElement("option");
                            sOpt["value"] = el["symbol"];
                            sOpt.innerHTML = el["symbol"]
                            addSel.appendChild(sOpt);
                        }

                        if (symbols.includes(el["symbol"])) {
                            sOpt = document.createElement("option");
                            sOpt["value"] = el["symbol"];
                            sOpt.innerHTML = el["symbol"]
                            removeSel.appendChild(sOpt);
                            sOpt = document.createElement("option");
                            sOpt["value"] = el["symbol"];
                            sOpt.innerHTML = el["symbol"]
                            dashboardSel.appendChild(sOpt);
                        }

                    }
                    $(function() {
                        jcf.replaceAll();
                    });
                });

        },
        addEventListeners: function() {

            document.getElementById("addListButton").addEventListener("click", function() {
                ProfileBase.dashboard.stockListButtons("add");
            });

            document.getElementById("removeListButton").addEventListener("click", function() {
                ProfileBase.dashboard.stockListButtons("remove");
            });

            document.getElementById("viewDashButton").addEventListener("click", function() {
                let y = $("#" + "dashboardList").val()
                window.location.href = "#dashDivCol" + y;
            });
        },
        stockListButtons: function(operation) {
            vex.dialog.buttons.YES.text = "Yes";
            vex.dialog.buttons.NO.text = "Cancel";
            vex.dialog.confirm({
                message: 'Are you sure you would like to ' + operation + ' these symbols?',
                callback: function(value) {
                    if (value) {
                        let selectedStocks = $("#" + operation + "StockList").val()
                        if (operation == "add" && ProfileBase.dashboard.subscripCheck(selectedStocks.length)) {
                            return;
                        }
                        vex.dialog.buttons.YES.text = operation;
                        vex.dialog.prompt({
                            message: 'Please re-enter your password',
                            placeholder: 'Password',
                            callback: function(value) {
                                if (value) {
                                    if (value != JSON.parse(String(localStorage.getItem("userData")))["password"]) {
                                        window.alert("Incorrect Password for user");
                                        this.open()
                                    } else {

                                        $.post("/" + operation + "Symbols", {
                                                "symbols": JSON.stringify(selectedStocks, null, 2)
                                            })
                                            .done(function(data, status) {
                                                vex.dialog.buttons.YES.text = "Okay";
                                                vex.dialog.alert({
                                                    message: 'Success!',
                                                    callback: function(value) {
                                                        localStorage.setItem("userData", data)
                                                        ProfileBase.dashboard.generateStockList()
                                                        ProfileBase.dashboard.dashboardProfile()
                                                        ProfileBase.dashboard.dashboardStocks()
                                                        //ProfileBase.dashboard.dashCharts()
                                                    }

                                                })

                                            });
                                    }
                                }
                            }
                        })
                    }
                }
            })
        },

        subscripCheck: function(lengthOfSymbolsToAdd) {
            let ou = JSON.parse(String(localStorage.getItem("userData")))["symbols"].length + lengthOfSymbolsToAdd;
            let subscrip = JSON.parse(String(localStorage.getItem("userData")))["subscriptionType"];
            let overflow = false;
            if (subscrip == "Free Subscription" && ou > 2) {
                overflow = true;
            } else if (subscrip == "Basic Subscription" && ou > 10) {
                overflow = true;
            } else if (subscrip == "Premium Subscription" && ou > 30) {
                overflow = true;
            } //else if (subscrip == "Platinum Subscription" && ou > 50) {
            //overflow = true;
            //}
            if (overflow) {
                vex.dialog.buttons.YES.text = "Okay";
                vex.dialog.alert('You have reached the limit for your subscription type.')
            }
            return overflow;


        }

    },
    stockColorKey: {
        init: function(divId) {
            let sctColumns = [{
                    title: "Key",
                    field: "key",
                    align: "center",
                    formatter: function(cell) {
                        cell.getElement().style.height = "25px"
                        return cell.getValue()
                    }
                },
                {
                    title: "Value",
                    field: "value",
                    align: "center",
                    formatter: function(cell) {
                        cell.getElement().style.height = "25px"
                        return cell.getValue()
                    }
                },
            ];
            let sctData = this.colorKey;
            var SCT = new Tabulator("#" + divId, {
                tooltips: function(cell) {
                    return cell.getValue();
                },
                height: "280px",
                data: sctData,
                layout: "fitColumns",
                rowFormatter: function(row) {
                    let key = row.getCell("key").getValue();
                    let c = sctData.find(element => element["key"] == key)["color"].toUpperCase();
                    row.getElement().style.backgroundColor = c;
                    if (ProfileBase.stockColorKey.returnColorWhiteTextArray().includes(c.toUpperCase())) {
                        row.getElement().style.color = "white";
                    }
                },
                columns: sctColumns,
            });
            SCT.redraw()
        },
        returnColorKey: function() {
            return this.colorKey;
        },
        returnColorWhiteTextArray: function(){
            return this.colorWhiteTextArray;
        },

        colorKey: [
            { key: "Navy Blue", value: "Short Entry Region", color: "#000080" },
            { key: "Cyan", value: "Short Entry Region", color: "#00D7AF" },
            { key: "Blue", value: "Short Entry Region", color: "#1F75FE" },
            { key: "Dark Green", value: "Long Entry Region", color: "#005F00" },
            { key: "Green", value: "Long Entry Region", color: "#1CAC78" },
            { key: "Lime", value: "Low Entry Level Day", color: "#00FF00" },
            { key: "Magenta", value: "Profit Level 1", color: "#F664AF" },
            { key: "Purple", value: "Profit Level 2", color: "#800080" },
            { key: "Yellow", value: "Breakout Day", color: "#FCE883" },
            { key: "Red", value: "No Entry", color: "#EE204D" }

        ],

        colorWhiteTextArray: ["#000080", "#1F75FE", "#005F00", "#1CAC78", "#F664AF", "#800080", "#EE204D"]
    }

}