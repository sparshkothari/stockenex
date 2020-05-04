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
                    { key: "Green", value: "Long Entry Region", color: "#1CAC78" },
                    { key: "Lime", value: "Low Entry Level Day", color: "#00FF00" },
                    { key: "Magenta", value: "Profit Level 1", color: "#F664AF" },
                    { key: "Purple", value: "Profit Level 2", color: "#800080" },
                    { key: "Yellow", value: "Breakout Day", color: "#FCE883" },
                    { key: "Red", value: "No Entry", color: "#EE204D" },
                    { key: "Light Blue", value: "Short Entry Region", color: "#1F75FE" },
                    { key: "Cyan", value: "Short Entry Region", color: "#00D7AF" },
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
                        ProfileBase.dashboard.rangeAreaChart(tr, "individualChart")
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

        rangeAreaChart: function(data_, divName) {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create(divName, am4charts.XYChart);
            chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

            let data = []
            let data__ = data_[0]
            for (let i = 0; i < data__["slw"].length; i++) {
                data.push({
                    date: new Date(2018, 0, i),
                    slw: data__.slw[i],
                    enwl: data__.enwl[i],
                    enwh: data__.enwh[i],
                    exwl: data__.exwl[i],
                    exwh: data__.exwh[i],
                    close: data__.close[i]
                });
            }

            var title = chart.titles.create();
            title.text = data__["symbol"];

            chart.data = data;

            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());

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

                let dotColor;
                if (name == "slw") {
                    dotColor = am4core.color("#EE204D")
                } else if (name == "enwh" || name == "exwh") {
                    dotColor = am4core.color("#005f00")
                } else if (name == "exwh" || "exwl") {
                    dotColor = am4core.color("#F664AF")
                }
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

                if (strokeColor == "#000000") {
                    series.fillOpacity = 0;
                    series.tensionX = 1;
                }
                var bullet = series.bullets.push(new am4charts.CircleBullet());
                    bullet.circle.stroke = am4core.color("#fff");
                    bullet.circle.strokeWidth = 2;
                    bullet.circle.fill = series.stroke

                return series;

            }

                createSeries("close", null, "close", null, "#000000")
            if (data__["enwh"] < data__["exwl"]) {
                createSeries("exwh", "exwl", "exwh", "#F664AF", "#F664AF")
                createSeries("exwl", "enwh", "exwl", "#FFA500", "#F664AF")
                createSeries("enwh", "enwl", "enwh", "#005f00", "#005f00")
                createSeries("enwl", "slw", "enwl", "#EE204D", "#005f00")
                createSeries("slw", null, "slw", "#FFFFFF", "#EE204D")
            }else{
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
            chart.legend.data = [{
                "name": "Slw",
                "fill": "#EE204D"
            }, {
                "name": "Enw",
                "fill": "#005f00"
            }, {
                "name": "Exw",
                "fill": "#F664AF"
            }, {
                "name": "Close",
                "fill": "#000000"
            }];

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
                            ProfileBase.dashboard.rangeAreaChart(tr, dashDivElementNameArray[i])
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
            /*let u = new Object()
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

            return u;*/
            return item;
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
                ProfileBase.dashboard.stockListButtons("add");
            });

            document.getElementById("removeListButton").addEventListener("click", function() {
                ProfileBase.dashboard.stockListButtons("remove");
            });

        },
        stockListButtons: function(operation) {
            vex.dialog.buttons.YES.text = "Yes";
            vex.dialog.buttons.NO.text = "Cancel";
            vex.dialog.confirm({
                message: 'Are you sure you would like to ' + operation + ' these symbols?',
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
                                        let y = $("#" + operation + "StockList").val()
                                        $.post("/" + operation + "Symbols", {
                                                "symbols": JSON.stringify(y, null, 2)
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