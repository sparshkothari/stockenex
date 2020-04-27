//userStocksTabulator.js
function dashboardStocksTabulator(data) {
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
            { key: "Light Blue", value: "unknownLightBlue", color: "#1F75FE" }
        ]

        this.returnColor = function(value) {
            return i.find(element => element["value"] == value)["color"];
        }

        this.returnValue = function(color) {
            //debugger;
            console.log(color)
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
                }

                let ou;
                if (operation == "add") {
                    let ou = JSON.parse(String(localStorage.getItem("userData")))["symbols"].length + 1;
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
                        return;
                    }

                }
                vex.dialog.buttons.YES.text = operation;
                vex.dialog.confirm({
                    message: 'Would you like to ' + operation + ' this symbol to your account?',
                    callback: function(value) {
                        if (value) {
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
                                                    dashboardProfile()
                                                    dashCharts()
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
}

function dashboardProfile() {
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
                y.style = "text-align:center; animation-duration:6s; width:33%; height: 600px; margin-left: auto; margin-right: auto";
                z.appendChild(y);
                let sy = cell.getRow().getCell("symbol").getValue();
                let val = cell.getRow().getCell("value").getValue();
                let item = new Object();
                item["symbol"] = sy;
                item["value"] = val;
                let tr = [];
                let obj = getDashObject(item);
                tr.push(obj);
                stackedColumnChart(tr, "individualChart")
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
}

function dashboardStocks() {
    $.get("/stock")
        .done(function(data, status) {
            var data_ = data;
            dashboardStocksTabulator(data_);
        });
}





function stackedColumnChart(data_, divName) {

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create(divName, am4charts.XYChart);

    //chart.legend = new am4charts.Legend();
    //chart.legend.position = "right";

    var exwhHigh = false;
    data__ = data_[0]
    if (data__["slwh"] < data__["exwh"]) {
        //MCD,DarkGreen,Close=164.01  (LCB0L[ Enw= (144.92-153.73) Exw= (176.09-199.15) Slw= (134.10-134.10)  ])
        exwhHigh = true;

        data___ = [{
            "symbol": data__["symbol"],
            "base": data__["slwh"],
            "slwp": data__["enwl"] - data__["slwh"],
            "enw": data__["enwh"] - data__["enwl"],
            "gap": data__["exwl"] - data__["enwh"],
            "exw": data__["exwh"] - data__["exwl"]
        }];
        chart.colors.list = [
            am4core.color("#0000ff"),
            am4core.color("#EE204D"),
            am4core.color("#005f00"),
            am4core.color("#FFA500"),
            am4core.color("#F664AF"),
        ];
    } else {
        //PG,Lime,Close=110.17  (SS0L[ Enw= (111.55-105.96) Exw= (91.76-77.12) Slw= (116.88-123.70)  ])
        data___ = [{
            "symbol": data__["symbol"],
            "base": data__["exwh"],
            "exw": data__["exwl"] - data__["exwh"],
            "gap1": data__["enwh"] - data__["exwl"],
            "enw": data__["enwl"] - data__["enwh"],
            "gap2": data__["slwl"] - data__["enwl"],
            "slwp": data__["slwh"] - data__["slwl"]
        }];

        chart.colors.list = [
            am4core.color("#0000ff"),
            am4core.color("#F664AF"),
            am4core.color("#FFA500"),
            am4core.color("#005f00"),
            am4core.color("#FFA500"),
            am4core.color("#EE204D"),

        ];

    }
    console.log(data___)
    chart.data = data___


    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "symbol";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");



    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = data___[0]["base"];
    valueAxis.title.text = "$(US)";
    valueAxis.title.fill = am4core.color("#FFFFFF");
    valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
    valueAxis.renderer.inside = true;


    var i;
    i = 0;
    // Create series
    function createSeries(field, name) {

        // Set up series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.name = name;
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "symbol";
        series.sequencedInterpolation = true;

        // Make it stacked
        series.stacked = true;

        // Configure columns
        series.columns.template.width = am4core.percent(60);
        if (i > 0) {
            if (exwhHigh) {
                if (i == 1) {
                    series.columns.template.tooltipText = "[bold]{name}[/]\n" + "Low: " + data__.slwh + "[/]\nHigh: " + data__.enwl;
                    series.tooltip.pointerOrientation = "left"
                } else if (i == 2) {
                    series.columns.template.tooltipText = "[bold]{name}[/]\n" + "Low: " + data__.enwl + "[/]\nHigh: " + data__.enwh;
                    series.tooltip.pointerOrientation = "right"
                } else if (i == 3) {
                    //do nothing
                } else if (i == 4) {
                    series.columns.template.tooltipText = "[bold]{name}[/]\n" + "Low: " + data__.exwl + "[/]\nHigh: " + data__.exwh;
                    series.tooltip.pointerOrientation = "up"
                }
            } else {
                if (i == 1) {
                    series.columns.template.tooltipText = "[bold]{name}[/]\n" + "Low: " + data__.exwl + "[/]\nHigh: " + data__.exwh;
                    series.tooltip.pointerOrientation = "left"
                } else if (i == 2) {
                    //do nothing
                } else if (i == 3) {
                    series.columns.template.tooltipText = "[bold]{name}[/]\n" + "Low: " + data__.enwl + "[/]\nHigh: " + data__.enwh;
                    series.tooltip.pointerOrientation = "right";
                } else if (i == 4) {
                    //do nothing
                } else if (i == 5) {
                    series.columns.template.tooltipText = "[bold]{name}[/]\n" + "Low: " + data__.slwl + "[/]\nHigh: " + data__.slwh;
                    series.tooltip.pointerOrientation = "left"
                }
            }
            series.columns.template.alwaysShowTooltip = true

            //series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";
        }

        // Add label
        //var labelBullet = series.bullets.push(new am4charts.LabelBullet());
        //labelBullet.label.text = "{name}"/*"[bold]{name}[/]\n" +  //data__.slw + "-" + data__.enwl;
        //labelBullet.locationY = 0.5;
        //labelBullet.label.hideOversized = true;

        i = i + 1;
        return series;
    }

    createSeries("base", "")

    if (exwhHigh) {
        createSeries("slwp", "SLW")
        createSeries("enw", "ENW")
        createSeries("gap", "gap")
        createSeries("exw", "EXW")
    } else {
        createSeries("exw", "EXW")
        createSeries("gap1", "gap")
        createSeries("enw", "ENW")
        createSeries("gap2", "gap")
        createSeries("slwp", "SLW")
    }

    //chart.cursor = new am4charts.XYCursor();

    //Legend
    //chart.legend = new am4charts.Legend();
    //chart.legend.position = "right";
    //chart.legend.labels.template.fill = am4core.color("#FFFFFF");
    //chart.legend.labels.template.textDecoration = "none";
    //chart.legend.valueLabels.template.textDecoration = "none";
}


function dashCharts() {
    let symbols = JSON.parse(localStorage.getItem("userData"))["symbols"]
    var dashDivElementNameArray = createDashDivElements(symbols.length);
    $.get("/stock")
        .done(function(data, status) {
            let y = []
            let i = 0;
            for (let item of data) {
                if (symbols.includes(item["symbol"])) {
                    let u = getDashObject(item)
                    let tr = []
                    tr.push(u)
                    //variableWidthCurvedColumnChart(tr, dashDivElementNameArray[i]);
                    //verticalLayeredColumnChart(tr, dashDivElementNameArray[i]);
                    stackedColumnChart(tr, dashDivElementNameArray[i])
                    i = i + 1
                    //y.push(u)
                }
            }
            //horizontalLayeredColumnChart(y)
            //verticalLayeredColumnChart(y)
            //variableWidthCurvedColumnChart(y)
        });
}

function getDashObject(item) {
    let u = new Object()
    u.symbol = item["symbol"]
    let v = item["value"]
    let enw = v.split("Enw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
    let exw = v.split("Exw= ")[1].split(" ")[0].split("(")[1].split(")")[0]
    let slw = v.split("Slw= ")[1].split(" ")[0].split("(")[1].split(")")[0]

    u.enwl = parseFloat(enw.split("-")[0])
    u.enwh = parseFloat(enw.split("-")[1])

    u.exwl = parseFloat(exw.split("-")[0])
    u.exwh = parseFloat(exw.split("-")[1])

    u.slwl = parseFloat(slw.split("-")[0])
    u.slwh = parseFloat(slw.split("-")[1])
    return u;
}


function createDashDivElements() {
    let o = []
    let rowCount = 15
    let columnCount = 3
    let cellCount = rowCount * columnCount
    let dash = document.getElementById("dashRows");
    dash.innerHTML = "";
    for (let i = 0; i < cellCount; i++) {

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
        i = i + columnCount;
    }
    return o;
}



/*function variableWidthCurvedColumnChart(data_, divName) {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(divName, am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    /*chart.data = [{
        "country": "One",
        "value1": 125,
        "value2": 525,
        "value3": 325
    }, {
        "country": "Two",
        "value1": 825,
        "value2": 225,
        "value3": 525
    }, {
        "country": "Three",
        "value1": 525,
        "value2": 325,
        "value3": 225
    }];

    chart.data = data_;

    chart.colors.list = [
        am4core.color("#F664AF"),
        am4core.color("#FFA500"),
        am4core.color("#005f00"),
        am4core.color("#EE204D"),
        am4core.color("#FFFFFF"),
    ];

    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "symbol";
    categoryAxis.renderer.minGridDistance = 40;
    categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
    valueAxis.title.text = "$(US)";
    valueAxis.title.fill = am4core.color("#FFFFFF");

    var series = chart.series.push(new am4charts.CurvedColumnSeries());
    series.dataFields.categoryX = "symbol";

    series.dataFields.valueY = "exwh";
    series.tooltipText = "exwh {valueY.value}"
    series.columns.template.strokeOpacity = 0;
    series.clustered = false;
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color("#F664AF");

    var series2 = chart.series.push(new am4charts.CurvedColumnSeries());
    series2.dataFields.categoryX = "symbol";

    series2.dataFields.valueY = "exwl";
    series2.tooltipText = "exwl {valueY.value}"
    series2.columns.template.strokeOpacity = 0;
    series2.clustered = false;
    series2.tooltip.getFillFromObject = false;
    series2.tooltip.background.fill = am4core.color("#F664AF");

    var series3 = chart.series.push(new am4charts.CurvedColumnSeries());
    series3.dataFields.categoryX = "symbol";

    series3.dataFields.valueY = "enwh";
    series3.tooltipText = "enwh {valueY.value}"
    series3.columns.template.strokeOpacity = 0;
    series3.clustered = false;
    series3.tooltip.getFillFromObject = false;
    series3.tooltip.background.fill = am4core.color("#005f00");

    var series4 = chart.series.push(new am4charts.CurvedColumnSeries());
    series4.dataFields.categoryX = "symbol";

    series4.dataFields.valueY = "enwl";
    series4.tooltipText = "enwl {valueY.value}"
    series4.columns.template.strokeOpacity = 0;
    series4.clustered = false;
    series4.tooltip.getFillFromObject = false;
    series4.tooltip.background.fill = am4core.color("#005f00");

    var series5 = chart.series.push(new am4charts.CurvedColumnSeries());
    series5.dataFields.categoryX = "symbol";

    series5.dataFields.valueY = "slw";
    series5.tooltipText = "slw {valueY.value}"
    series5.columns.template.strokeOpacity = 0;
    series5.clustered = false;
    series5.tooltip.getFillFromObject = false;
    series5.tooltip.background.fill = am4core.color("#EE204D");

    chart.cursor = new am4charts.XYCursor();
    //chart.cursor.maxTooltipDistance = 0;

    var scrollbarY = new am4core.Scrollbar();
    var scrollbarX = new am4core.Scrollbar();

    chart.scrollbarY = scrollbarY;


    series.dataItems.template.adapter.add("width", (width, target) => {
        return am4core.percent(target.valueY / valueAxis.max * 100);
    })

    series2.dataItems.template.adapter.add("width", (width, target) => {
        return am4core.percent(target.valueY / valueAxis.max * 100);
    })

    series3.dataItems.template.adapter.add("width", (width, target) => {
        return am4core.percent(target.valueY / valueAxis.max * 100);
    })


    series4.dataItems.template.adapter.add("width", (width, target) => {
        return am4core.percent(target.valueY / valueAxis.max * 100);
    })


    series5.dataItems.template.adapter.add("width", (width, target) => {
        return am4core.percent(target.valueY / valueAxis.max * 100);
    })

    series.columns.template.events.on("parentset", function(event) {
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series2.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series3.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series4.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series5.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })


}

function verticalLayeredColumnChart(data_, divName) {


    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create(divName, am4charts.XYChart);

    // Add percent sign to all numbers
    //chart.numberFormatter.numberFormat = "#.#'%'";

    // Add data
    /*chart.data = [{
        "country": "USA",
        "year2004": 3.5,
        "year2005": 4.2
    }, {
        "country": "UK",
        "year2004": 1.7,
        "year2005": 3.1
    }, {
        "country": "Canada",
        "year2004": 2.8,
        "year2005": 2.9
    }, {
        "country": "Japan",
        "year2004": 2.6,
        "year2005": 2.3
    }, {
        "country": "France",
        "year2004": 1.4,
        "year2005": 2.1
    }, {
        "country": "Brazil",
        "year2004": 2.6,
        "year2005": 4.9
    }];

    let s = []
    s.push(data_[0])
    chart.data = s

    chart.colors.list = [
        am4core.color("#F664AF"),
        am4core.color("#FFA500"),
        am4core.color("#005f00"),
        am4core.color("#EE204D"),
        am4core.color("#000000"),
    ];

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "symbol";
    categoryAxis.renderer.grid.template.location = 0;
    //categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");
    //categoryAxis.renderer.cellStartLocation = 0.2;
    //categoryAxis.renderer.cellEndLocation = 0.8;


    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "$(US)";
    valueAxis.title.fill = am4core.color("#FFFFFF");
    valueAxis.title.fontWeight = 800;
    valueAxis.renderer.labels.template.fill = am4core.color("#FFFFFF");

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "exwh";
    series.dataFields.categoryX = "symbol";
    series.clustered = false;
    series.tooltipText = "exwh {valueY}[/]";
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color("#F664AF");

    var series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.valueY = "exwl";
    series2.dataFields.categoryX = "symbol";
    series2.clustered = false;
    //series2.columns.template.width = am4core.percent(50);
    series2.tooltipText = "exwl {valueY}[/]";
    series2.tooltip.getFillFromObject = false;
    series2.tooltip.background.fill = am4core.color("#F664AF");

    var series3 = chart.series.push(new am4charts.ColumnSeries());
    series3.dataFields.valueY = "enwh";
    series3.dataFields.categoryX = "symbol";
    series3.clustered = false;
    //series3.columns.template.width = am4core.percent(50);
    series3.tooltipText = "enwh {valueY}[/]";
    series3.tooltip.getFillFromObject = false;
    series3.tooltip.background.fill = am4core.color("#005f00");

    var series4 = chart.series.push(new am4charts.ColumnSeries());
    series4.dataFields.valueY = "enwl";
    series4.dataFields.categoryX = "symbol";
    series4.clustered = false;
    //series4.columns.template.width = am4core.percent(50);
    series4.tooltipText = "enwl {valueY}[/]";
    series4.tooltip.getFillFromObject = false;
    series4.tooltip.background.fill = am4core.color("#005f00");

    var series5 = chart.series.push(new am4charts.ColumnSeries());
    series5.dataFields.valueY = "slw";
    series5.dataFields.categoryX = "symbol";
    series5.clustered = false;
    //series5.columns.template.width = am4core.percent(50);
    series5.tooltipText = "slw {valueY}[/]";
    series5.tooltip.getFillFromObject = false;
    series5.tooltip.background.fill = am4core.color("#EE204D");


    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.disabled = true;
    chart.cursor.lineY.disabled = true;

    //var scrollbarY = new am4core.Scrollbar();
    //var scrollbarX = new am4core.Scrollbar();

    //chart.scrollbarY = scrollbarY;
    //chart.scrollbarX = scrollbarX;

    series.columns.template.events.on("parentset", function(event) {
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series2.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series3.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series4.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

    series5.columns.template.events.on("parentset", function(event) {
        event.target.parent = series.columnsContainer;
        event.target.zIndex = valueAxis.max - event.target.dataItem.valueY;
    })

}
*/