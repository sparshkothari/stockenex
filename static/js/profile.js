var ProfileBase = {

    init: function() {
        $.get("/user")
            .done(function(data, status) {
                localStorage.setItem("userData", JSON.stringify(data, null, 2))
                ProfileBase.profile.init()
                ProfileBase.subscrip.init()
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
                    hozAlign: "center",
                    width: 200,
                    formatter: function(cell) {
                        cell.getElement().style.height = "25px"
                        return cell.getValue()
                    },
                },
                {
                    title: "Value",
                    field: "Value",
                    hozAlign: "center",
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


    //userStocksTabulator.js
    dashboard: {

        init: function() {

            this.dashboardStocks();
            this.stockColorKey("stockColorKey");
            this.dashboardProfile();
            this.dashCharts();
            this.generateStockList();
            this.addEventListeners();

        },

        dashboardStocksTabulator: function(data) {
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

            let legendCMap = function() {
                let i = [{ key: "Navy Blue", value: "Short Entry Region", color: "#000080" },
                    { key: "Dark Green", value: "Long Entry Region", color: "#005F00" },
                    { key: "Lime", value: "Low Entry Level Day", color: "#00FF00" },
                    { key: "Magenta", value: "Profit Level 1", color: "#F664AF" },
                    { key: "Purple", value: "Profit Level 2", color: "#800080" },
                    { key: "Yellow", value: "Breakout Day", color: "#FCE883" },
                    { key: "Red", value: "No Entry", color: "#EE204D" },
                    { key: "Light Blue", value: "Short Entry Region", color: "#1F75FE" }
                ]

                this.returnColor = function(value) {
                    return i.find(element => element["value"] == value)["color"];
                }

                this.returnValue = function(color) {
                    //debugger;
                    return i.find(element => element["color"] == color.toUpperCase())["value"];
                }

            }


            for (let color of Object.keys(uniqueColors)) {
                tabColumns.push({
                    title: new legendCMap().returnValue(color),
                    field: color,
                    hozAlign: "center",
                    formatter: function(cell, formatterParams, onRendered) {
                        let sy = JSON.parse(localStorage.getItem("userData"))["symbols"]
                        if (cell.getValue()) {
                            if (sy.includes(cell.getValue())) {
                                cell.getElement().style.backgroundColor = "#C0C0C0";
                            } else {
                                cell.getElement().style.backgroundColor = color;
                            }
                            if (color == "#000080" || color == "#005f00") {
                                cell.getElement().style.color = "white";
                            }
                        } else {
                            cell.getElement().style.backgroundColor = "black";
                        }
                        return cell.getValue();
                    }
                })
            }
            var CCT = new Tabulator("#x1", {
                cellClick: function(e, cell) {
                    if (cell.getValue()) {
                        let operation = ""
                        if (cell.getElement().style.backgroundColor == "rgb(192, 192, 192)") {
                            operation = "remove"
                        } else {
                            operation = "add"
                            if (ProfileBase.dashboard.subscripCheck(1)) {
                                return;
                            }
                        }

                        vex.dialog.buttons.YES.text = "Yes";
                        vex.dialog.buttons.NO.text = "Cancel";
                        vex.dialog.confirm({
                            message: 'Would you like to ' + operation + ' this symbol to your account?',
                            callback: function(value) {
                                if (value) {
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
                                                    $.post("/symbol", {
                                                            symbol: cell.getValue(),
                                                            operation: operation
                                                        })
                                                        .done(function(data, status) {
                                                            localStorage.setItem("userData", data);
                                                            ProfileBase.dashboard.dashboardProfile()
                                                            ProfileBase.dashboard.dashCharts()
                                                            if (operation == "add") {
                                                                cell.getElement().style.backgroundColor = "#C0C0C0"
                                                            } else if (operation == "remove") {
                                                                let title = cell.getColumn().getDefinition().title //legendCMapSort
                                                                cell.getElement().style.backgroundColor = new legendCMap().returnColor(title);
                                                            }
                                                        });
                                                }
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                },
                height: "100%",
                data: tabData,
                layout: "fitColumns",
                columns: tabColumns,
            });
            CCT.redraw()
        },

        dashboardProfile: function() {
            let userData = JSON.parse(String(localStorage.getItem("userData")))
            let symbols = userData["symbols"]

            let ustColumns = [{
                    title: "",
                    field: "viewGraph",
                    hozAlign: "center",
                    formatter: "textarea",
                    width: 50,
                    cellClick: function(e, cell) {
                        let z = document.getElementById("IndividualDashboard");
                        z.innerHTML = "";
                        let y = document.createElement('div');
                        y.id = "individualChart";
                        y.classList.add("w3-animate-opacity");
                        y.style = "text-align:center; animation-duration:3s; width:33%; height: 600px; margin-left: auto; margin-right: auto";
                        z.appendChild(y);
                        let sy = cell.getRow().getCell("symbol").getValue();
                        let val = cell.getRow().getCell("value").getValue();
                        let item = new Object();
                        item["symbol"] = sy;
                        item["value"] = val;
                        let tr = [];
                        let obj = ProfileBase.dashboard.getDashObject(item);
                        tr.push(obj);
                        ProfileBase.dashboard.areaChart(tr, "individualChart")
                        openDTab("IndividualDashboard")
                    }
                },
                { title: "Symbol", field: "symbol", hozAlign: "center", width: 100 },
                {
                    title: "Value",
                    field: "value",
                    hozAlign: "center",
                    formatter: "textarea"
                }
            ]
            let ustData = []
            $.get("/stock")
                .done(function(data, status) {
                    var data_ = data;
                    for (let item of data_) {
                        if (symbols.includes(item["symbol"])) {
                            let u = new Object()
                            u.symbol = item["symbol"]
                            u.value = item["value"]
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
                            if (c == "#000080" || c == "#005F00") {
                                row.getElement().style.color = "white";
                            }
                        },
                        columns: ustColumns,
                    });
                    UserST.redraw()
                });
        },

        dashboardStocks: function() {
            $.get("/stock")
                .done(function(data, status) {
                    var data_ = data;
                    ProfileBase.dashboard.dashboardStocksTabulator(data_);
                });
        },

        axisRangeChart: function(data_, divName) {

            // Create chart instance
            var chart = am4core.create(divName, am4charts.XYChart);

            dataO_ = data_[0]

            let exwHigh = true;
            if (dataO_["slwh"] > dataO_["exwh"]) {
                exwHigh = false;
            }
            chart.data = data_
            chart.colors.list = [am4core.color("#0000FF")];

            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "symbol";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");


            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
            //valueAxis.renderer.opposite = true

            if (exwHigh) {
                valueAxis.min = dataO_["slwl"];
                valueAxis.max = dataO_["exwh"];
            } else {
                valueAxis.min = dataO_["exwh"];
                valueAxis.max = dataO_["slwl"];
            }

            // Create series
            var series = chart.series.push(new am4charts.ColumnSeries());
            if (exwHigh) {
                series.dataFields.valueY = "exwh";
            } else {
                series.dataFields.valueY = "slwl"
            }
            series.dataFields.categoryX = "symbol";
            //series.name = "Sales";

            /*       chart.colors.list = [
                        am4core.color("#0000ff"),
                        am4core.color("#EE204D"),
                        am4core.color("#005f00"),
                        am4core.color("#FFA500"),
                        am4core.color("#F664AF"),
                    ];*/
            // Create value axis range

            let r1v;
            let r1ev;

            let r2v;
            let r2ev;

            let r3v;
            let r3ev;

            let r4v;
            let r4ev;

            if (exwHigh) {
                r1v = dataO_["slwh"]
                r1ev = dataO_["enwl"]

                r2v = dataO_["enwl"]
                r2ev = dataO_["enwh"]

                r3v = dataO_["exwl"]
                r3ev = dataO_["exwh"]

                r4v = r2ev
                r4ev = r3v

                //r4v = data_[]
            } else {
                r1v = dataO_["enwl"]
                r1ev = dataO_["slwl"]

                r2v = dataO_["enwh"]
                r2ev = dataO_["enwl"]

                r3v = dataO_["exwh"]
                r3ev = dataO_["exwl"]

                r4v = r2v
                r4ev = r3ev

            }

            let rClose = dataO_["close"]

            var range = valueAxis.createSeriesRange(series);
            range.value = r1v;
            range.endValue = r1ev;
            range.contents.stroke = am4core.color("#EE204D");
            range.contents.fill = range.contents.stroke;
            //range.axisFill.tooltip = new am4core.Tooltip();
            //range.axisFill.tooltipText = "Slw[/]\n" + "Low: " + r1v + "[/]\nHigh: " + r1ev
            //range.axisFill.interactionsEnabled = true;
            //range.axisFill.isMeasured = true;
            //range.axisFill.alwaysShowTooltip = true;
            //range.axisFill.tooltip.getFillFromObject = false;
            //range.axisFill.tooltip.background.fill = range.contents.stroke;
            //range.axisFill.tooltip.background.cornerRadius = 20;
            //range.axisFill.tooltip.background.strokeOpacity = 0;
            //range.axisFill.tooltip.pointerOrientation = "vertical";
            //range.axisFill.tooltip.label.minWidth = 40;
            //range.axisFill.tooltip.label.minHeight = 40;
            //range.axisFill.tooltip.label.textAlign = "middle";
            //range.axisFill.tooltip.label.textValign = "middle";
            //range.axisFill.tooltip.background.stroke = am4core.color("#000000")
            //range.axisFill.tooltip.background.strokeWidth = 5;

            // Create value axis range
            var range2 = valueAxis.createSeriesRange(series);
            range2.value = r2v;
            range2.endValue = r2ev;
            range2.contents.stroke = am4core.color("#005f00");
            range2.contents.fill = range2.contents.stroke;
            //range2.axisFill.tooltip = new am4core.Tooltip();
            //range2.axisFill.tooltipText = "Enw[/]\n" + "Low: " + r2v + "[/]\nHigh: " + r2ev
            //range2.axisFill.interactionsEnabled = true;
            //range2.axisFill.isMeasured = true;
            //range2.axisFill.alwaysShowTooltip = true;
            //range2.axisFill.tooltip.getFillFromObject = false;
            //range2.axisFill.tooltip.background.fill = range2.contents.stroke;


            // Create value axis range
            var range3 = valueAxis.createSeriesRange(series);
            range3.value = r3v;
            range3.endValue = r3ev;
            range3.contents.stroke = am4core.color("#F664AF");
            range3.contents.fill = range3.contents.stroke;
            //range3.axisFill.tooltip = new am4core.Tooltip();
            //range3.axisFill.tooltipText = "Exw[/]\n" + "Low: " + r3v + "[/]\nHigh: " + r3ev
            //range3.axisFill.interactionsEnabled = true;
            //range3.axisFill.isMeasured = true;
            //range3.axisFill.alwaysShowTooltip = true;
            //range3.axisFill.tooltip.getFillFromObject = false;
            //range3.axisFill.tooltip.background.fill = range3.contents.stroke;

            // Create value axis range

            //range3.axisFill.tooltip = new am4core.Tooltip();
            //range3.axisFill.tooltipText = "Exw[/]\n" + "Low: " + r3v + "[/]\nHigh: " + r3ev
            //range3.axisFill.interactionsEnabled = true;
            //range3.axisFill.isMeasured = true;
            //range3.axisFill.alwaysShowTooltip = true;
            //range3.axisFill.tooltip.getFillFromObject = false;
            //range3.axisFill.tooltip.background.fill = range3.contents.stroke;

            var range4 = valueAxis.createSeriesRange(series);
            range4.value = r4v;
            range4.endValue = r4ev;
            range4.contents.stroke = am4core.color("#FFA500");
            range4.contents.fill = range4.contents.stroke;


            var range5 = valueAxis.axisRanges.create();
            range5.value = rClose;
            range5.grid.stroke = am4core.color("#000000");
            range5.grid.strokeWidth = 5;
            range5.grid.strokeOpacity = 1;
            range5.grid.above = true
            //range4.label.text = "D-Close: " + rClose;
            //range4.label.fill = am4core.color("#FFFFFF");
            //range4.grid.disabled = true;
            //range4.bullet = new am4core.Circle();
            //range4.bullet.width = 100;
            //range4.bullet.height = 100;
            //var colorSet = new am4core.ColorSet()
            //range4.bullet.fill = colorSet.next();
            //range4.bullet.horizontalCenter = "middle";
            //range4.bullet.dx = 170
            //range4.label.dx = -25
            //range4.label.inside = true;
            //range4.label.align = "center";
            //range4.label.position = "left"
            //range4.label.verticalCenter = "bottom";
            //range4.label.horizontalCenter = "left";

            chart.legend = new am4charts.Legend();
            //chart.legend.parent = chart.chartContainer;
            chart.legend.background.fill = am4core.color("#0000FF");
            chart.legend.labels.template.fill = am4core.color("#FFFFFF")
            //chart.legend.background.fillOpacity = 0.05;
            chart.legend.width = 120;
            chart.legend.data = [{
                "name": "Slw: " + dataO_["slwl"],
                "fill": range.contents.stroke
            }, {
                "name": "Enw[/]\n" + "Low: " + r2v + "[/]\nHigh: " + r2ev,
                "fill": range2.contents.stroke
            }, {
                "name": "Exw[/]\n" + "Low: " + r3v + "[/]\nHigh: " + r3ev,
                "fill": range3.contents.stroke
            }, {
                "name": "Close: " + rClose,
                "fill": "#000000"
            }];

            chart.legend.position = "top";
            chart.legend.contentAlign = "center";
            chart.width = am4core.percent(100);

            //chart.align = "right"
            //chart.valign = "top"
        },

        areaChart: function(data_, divName) {

            let dataO_ = data_[0];
            let dataO__ = [];

            rClose = dataO_["close"];
            delete dataO_["close"];
            delete dataO_["slwh"]

            let vMax = dataO_[Object.keys(dataO_).reduce(function(a, b) { return dataO_[a] > dataO_[b] ? a : b })];
            let vMin = dataO_[Object.keys(dataO_).reduce(function(a, b) { return dataO_[a] < dataO_[b] ? a : b })];
            if (dataO_["enwh"] < dataO_["exwl"]) {

                let slwSet = false;
                let enwlSet = false;
                let enwhSet = false;
                let exwlSet = false;
                for (let i = 0; i < 11; i++) {
                    let j = new Object();
                    j.x = i;
                    //j.value = Math.pow((i - 500.0) / uDivide, 3.0) + (vDiff / 2.0) + vMin;
                    j.value = i * ((vMax - vMin) / 10) + vMin

                    if (dataO_["slwl"] - j.value < 1 && !slwSet) {
                        j.lineColor = "#EE204D";
                        slwSet = true;
                    } else if (dataO_["enwl"] - j.value < 1 && !enwlSet) {
                        j.lineColor = "#005f00";
                        enwlSet = true;
                    } else if (dataO_["enwh"] - j.value < 1 && !enwhSet) {
                        j.lineColor = "#FFA500";
                        enwhSet = true;

                    } else if (dataO_["exwl"] - j.value < 1 && !exwlSet) {
                        j.lineColor = "#F664AF";
                        exwlSet = true;
                    }

                    dataO__.push(j)
                }
            } else {

                let exwhSet = false;
                let exwlSet = false;
                let enwhSet = false;
                let enwlSet = false;
                for (let i = 0; i < 11; i++) {
                    let j = new Object();
                    j.x = i;
                    //j.value = Math.pow((i - 500.0) / uDivide, 3.0) + (vDiff / 2.0) + vMin;
                    j.value = i * ((vMax - vMin) / 10) + vMin

                    if (dataO_["exwh"] - j.value < 1 && !exwhSet) {
                        j.lineColor = "#F664AF";
                        exwhSet = true;
                    } else if (dataO_["exwl"] - j.value < 1 && !exwlSet) {
                        j.lineColor = "#FFA500";
                        exwlSet = true;
                    } else if (dataO_["enwh"] - j.value < 1 && !enwhSet) {
                        j.lineColor = "#005f00";
                        enwhSet = true;

                    } else if (dataO_["enwl"] - j.value < 1 && !enwlSet) {
                        j.lineColor = "#EE204D";
                        enwlSet = true;
                    }

                    dataO__.push(j)
                }
            }

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create(divName, am4charts.XYChart);
            var title = chart.titles.create();
            title.text = dataO_["symbol"];
            title.fill = am4core.color("#FFFFFF");
            //title.fontSize = 25;
            //title.marginBottom = 30;

            var data = [];

            chart.data = dataO__;

            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");

            //categoryAxis.renderer.grid.template.location = 0;
            //categoryAxis.renderer.ticks.template.disabled = true;
            //categoryAxis.renderer.line.opacity = 0;
            //categoryAxis.renderer.grid.template.disabled = true;
            //categoryAxis.renderer.minGridDistance = 40;
            categoryAxis.dataFields.category = "x";
            //categoryAxis.startLocation = 0.4;
            //categoryAxis.endLocation = 0.6;
            categoryAxis.renderer.labels.template.disabled = true;


            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.line.opacity = 1;
            valueAxis.renderer.ticks.template.disabled = true;

            valueAxis.max = dataO_[Object.keys(dataO_).reduce(function(a, b) { return dataO_[a] > dataO_[b] ? a : b })]
            valueAxis.min = dataO_[Object.keys(dataO_).reduce(function(a, b) { return dataO_[a] < dataO_[b] ? a : b })]

            var lineSeries = chart.series.push(new am4charts.LineSeries());
            lineSeries.dataFields.categoryX = "x";
            lineSeries.dataFields.valueY = "value";
            lineSeries.tooltipText = "$: {valueY.value}";
            lineSeries.fillOpacity = 1;
            lineSeries.strokeWidth = 3;
            lineSeries.propertyFields.stroke = "lineColor";
            lineSeries.propertyFields.fill = "lineColor";

            // var bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
            //bullet.circle.radius = 6;
            //bullet.circle.fill = am4core.color("#fff");
            //bullet.circle.strokeWidth = 3;

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.behavior = "panX";
            chart.cursor.lineX.opacity = 0;
            chart.cursor.lineY.opacity = 0;

            chart.scrollbarX = new am4core.Scrollbar();
            chart.scrollbarX.parent = chart.bottomAxesContainer;

            var range = valueAxis.axisRanges.create();
            range.value = rClose;
            range.grid.stroke = am4core.color("#000000");
            range.grid.strokeWidth = 5;
            range.grid.strokeOpacity = 1;
            range.grid.above = true;



            chart.legend = new am4charts.Legend();
            //chart.legend.parent = chart.chartContainer;
            //chart.legend.background.fill = am4core.color("#0000FF");
            chart.legend.labels.template.fill = am4core.color("#FFFFFF")
            //chart.legend.label.fill = "#"
            //chart.legend.background.fillOpacity = 0.05;
            //chart.legend.width = 120;
            chart.legend.data = [{
                "name": "Slw: " + dataO_["slwl"],
                "fill": "#EE204D"
            }, {
                "name": "Enw[/]\n" + "Low: " + dataO_["enwl"] + "[/]\nHigh: " + dataO_["enwh"],
                "fill": "#005f00"
            }, {
                "name": "Exw[/]\n" + "Low: " + dataO_["exwl"] + "[/]\nHigh: " + dataO_["exwh"],
                "fill": "#F664AF"
            }, {
                "name": "Close: " + rClose,
                "fill": "#000000"
            }];

            chart.legend.position = "top";
            //chart.legend.contentAlign = "center";
            //chart.width = am4core.percent(100);

        },


        dashCharts: function() {
            let symbols = JSON.parse(localStorage.getItem("userData"))["symbols"]
            var dashDivElementNameArray = this.createDashDivElements(symbols.length);
            $.get("/stock")
                .done(function(data, status) {
                    let y = []
                    let i = 0;
                    for (let item of data) {
                        if (symbols.includes(item["symbol"])) {
                            let u = ProfileBase.dashboard.getDashObject(item)
                            let tr = []
                            tr.push(u)
                            ProfileBase.dashboard.areaChart(tr, dashDivElementNameArray[i])
                            i = i + 1
                            //y.push(u)
                        }
                    }
                    //horizontalLayeredColumnChart(y)
                    //verticalLayeredColumnChart(y)
                    //variableWidthCurvedColumnChart(y)
                });
        },

        getDashObject: function(item) {
            let u = new Object()
            u.symbol = item["symbol"]
            let v = item["value"]
            let enw = v.split("Enw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            let exw = v.split("Exw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            let slw = v.split("Slw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
            let close = v.split("Close=")[1].split(" ")[0]

            u.enwl = parseFloat(enw.split("-")[0])
            u.enwh = parseFloat(enw.split("-")[1])

            u.exwl = parseFloat(exw.split("-")[0])
            u.exwh = parseFloat(exw.split("-")[1])

            u.slwl = parseFloat(slw.split("-")[0])
            u.slwh = parseFloat(slw.split("-")[1])

            u.close = close;

            return u;
        },


        createDashDivElements: function(length) {
            let o = [];
            //let rowCount = 15
            let columnCount = 3;
            let cellCount = length; //rowCount * columnCount
            let dash = document.getElementById("dashRows");
            dash.innerHTML = "";
            for (let i = 0; i < cellCount; i = i + columnCount) {

                if (i % columnCount == 0) {
                    let y = document.createElement("div");
                    divRowName = "dashDivRow" + i;
                    y.id = divRowName;
                    y.classList = "w3-row";
                    dash.appendChild(y);

                    for (let j = 0; j < columnCount; j++) {
                        let u = document.createElement("div");
                        u.classList = "w3-col s4 w3-center";
                        divColName = "dashDivCol" + (i + j);
                        u.id = divColName;
                        u.style.height = "600px"
                        y.appendChild(u);
                        o.push(divColName);

                    }
                }
            }
            return o;
        },

        stockColorKey: function(divId) {
            let sctColumns = [ //Define Table Columns
                {
                    title: "Key",
                    field: "key",
                    hozAlign: "center",
                    formatter: function(cell) {
                        cell.getElement().style.height = "25px"
                        return cell.getValue()
                    }
                },
                {
                    title: "Value",
                    field: "value",
                    hozAlign: "center",
                    formatter: function(cell) {
                        cell.getElement().style.height = "25px"
                        return cell.getValue()
                    }
                },
            ];
            let sctData = [
                { key: "Navy Blue", value: "Short Entry Region", color: "#000080" },
                { key: "Dark Green", value: "Long Entry Region", color: "#005F00" },
                { key: "Lime", value: "Low Entry-Level Day", color: "#00FF00" },
                { key: "Magenta", value: "Profit Level 1", color: "#F664AF" },
                { key: "Purple", value: "Profit Level 2", color: "#800080" },
                { key: "Yellow", value: "Breakout Day", color: "#FCE883" },
                { key: "Red", value: "No Entry", color: "#EE204D" },
            ];
            var SCT = new Tabulator("#" + divId, {
                tooltips: function(cell) {
                    return cell.getValue();
                },
                height: "205px",
                data: sctData,
                layout: "fitColumns",
                rowFormatter: function(row) {
                    let val = row.getCell("value").getValue();
                    let c = sctData.find(element => element["value"] == val)["color"].toUpperCase();
                    row.getElement().style.backgroundColor = c;
                    if (c == "#000080" || c == "#005F00" || c == "#800080") {
                        row.getElement().style.color = "white";
                    }
                },
                columns: sctColumns,
            });
            SCT.redraw()
        },

        generateStockList: function() {
            let symbols = JSON.parse(localStorage.getItem("userData"))["symbols"]
            $.get("/stock")
                .done(function(data, status) {
                    let addSel = document.getElementById("addStockList");
                    let removeSel = document.getElementById("removeStockList");
                    addSel.innerHTML = "";
                    removeSel.innerHTML = ""
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
                        }

                    }
                    $(function() {
                        jcf.replaceAll();
                    });
                });

        },
        addEventListeners: function() {

            document.getElementById("addListButton").addEventListener("click", function() {
                vex.dialog.buttons.YES.text = "Yes";
                vex.dialog.buttons.NO.text = "Cancel";
                vex.dialog.confirm({
                    message: 'Are you sure you would like to add these symbols to your account?',
                    callback: function(value) {
                        if (value) {
                            vex.dialog.buttons.YES.text = "add";
                            vex.dialog.prompt({
                                message: 'Please re-enter your password',
                                placeholder: 'Password',
                                callback: function(value) {
                                    if (value) {
                                        if (value != JSON.parse(String(localStorage.getItem("userData")))["password"]) {
                                            window.alert("Incorrect Password for user");
                                            this.open()
                                        } else {
                                            let x = $("#addStockList").val()
                                            if (ProfileBase.dashboard.subscripCheck(x.length)) {
                                                return;
                                            }
                                            $.post("/addSymbols", {
                                                    "symbols": JSON.stringify(x, null, 2)
                                                })
                                                .done(function(data, status) {
                                                    vex.dialog.buttons.YES.text = "Okay";
                                                    vex.dialog.alert({
                                                        message: 'You successfully added the selected symbols!',
                                                        callback: function(value) {
                                                            localStorage.setItem("userData", data)
                                                            ProfileBase.dashboard.generateStockList()
                                                            ProfileBase.dashboard.dashboardProfile()
                                                            ProfileBase.dashboard.dashboardStocks()
                                                            ProfileBase.dashboard.dashCharts()
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

            });

            document.getElementById("removeListButton").addEventListener("click", function() {
                vex.dialog.buttons.YES.text = "Yes";
                vex.dialog.buttons.NO.text = "Cancel";
                vex.dialog.confirm({
                    message: 'Are you sure you would like to remove these symbols from your account?',
                    callback: function(value) {
                        if (value) {
                            vex.dialog.buttons.YES.text = "remove";
                            vex.dialog.prompt({
                                message: 'Please re-enter your password',
                                placeholder: 'Password',
                                callback: function(value) {
                                    if (value) {
                                        if (value != JSON.parse(String(localStorage.getItem("userData")))["password"]) {
                                            window.alert("Incorrect Password for user");
                                            this.open()
                                        } else {
                                            let y = $("#removeStockList").val()
                                            $.post("/removeSymbols", {
                                                    "symbols": JSON.stringify(y, null, 2)
                                                })
                                                .done(function(data, status) {
                                                    vex.dialog.buttons.YES.text = "Okay";
                                                    vex.dialog.alert({
                                                        message: 'You successfully removed the selected symbols!',
                                                        callback: function(value) {
                                                            localStorage.setItem("userData", data)
                                                            ProfileBase.dashboard.generateStockList()
                                                            ProfileBase.dashboard.dashboardProfile()
                                                            ProfileBase.dashboard.dashboardStocks()
                                                            ProfileBase.dashboard.dashCharts()
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
            });

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
            } else if (subscrip == "Platinum Subscription" && ou > 50) {
                overflow = true;
            }
            if (overflow) {
                vex.dialog.buttons.YES.text = "Okay";
                vex.dialog.alert('You have reached the limit for your subscription type.')
            }
            return overflow;


        }

    }

}