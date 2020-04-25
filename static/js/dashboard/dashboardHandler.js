//userStocksTabulator.js
function dashboardStocksTabulator(data) {
    var uniqueColors = data.reduce(function(a, b) {
        if (a[b['color']]) {
            a[b['color']].push({ value: b['value'], symbol: b['symbol'] })
        } else {
            a[b['color']] = [{ value: b['value'], symbol: b['symbol'] }]
        }
        return a
    }, {})
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
    for (let color of Object.keys(uniqueColors)) {
        tabColumns.push({
            title: color,
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
                                                        cell.getElement().style.backgroundColor = cell.getColumn().getDefinition().title
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

    let ustColumns = [
        { formatter: "rownum", hozAlign: "center", width: 50 },
        { title: "Symbol", field: "Symbol", hozAlign: "center", width: 100 },
        {
            title: "Value",
            field: "Value",
            hozAlign: "center",
            formatter: "textarea"
        },
        {
            title: "Color",
            field: "Color",
            hozAlign: "center"
        }
    ]
    let ustData = []
    $.get("/stock")
        .done(function(data, status) {
            var data_ = data;
            for (let item of data_) {
                if (symbols.includes(item["symbol"])) {
                    let u = new Object()
                    u.Symbol = item["symbol"]
                    u.Value = item["value"]
                    u.Color = item["color"]
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
                    let c = row.getCell("Color").getValue();
                    row.getElement().style.backgroundColor = c;
                    if (c == "#000080" || c == "#005f00") {
                        row.getElement().style.color = "white";
                    }
                },
                columns: ustColumns,
            });
            UserST.redraw()
            UserST.hideColumn("Color")
        });
}

function dashboardStocks() {
    $.get("/stock")
        .done(function(data, status) {
            var data_ = data;
            dashboardStocksTabulator(data_);
        });
}


function variableWidthCurvedColumnChart(data_, divName) {
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
    }];*/

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


function dashCharts() {
    let symbols;
    if (!localStorage.getItem("userData")) {
        symbols = userDataFromMongo["symbols"];
    } else {
        symbols = JSON.parse(localStorage.getItem("userData"))["symbols"]
    }
    let dash = document.getElementById("dashRows");
    dash.innerHTML = "";
    var dashDivElementNameArray = createDashDivElements(symbols.length);
    $.get("/stock")
        .done(function(data, status) {
            let y = []
            let i = 0;
            for (let item of data) {
                if (symbols.includes(item["symbol"])) {
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

                    u.slw = parseFloat(slw.split("-")[0])
                    let tr = []
                    tr.push(u)
                    variableWidthCurvedColumnChart(tr, dashDivElementNameArray[i]);
                    i = i + 1
                    //y.push(u)
                }
            }
            //horizontalLayeredColumnChart(y)
            //verticalLayeredColumnChart(y)
            //variableWidthCurvedColumnChart(y)
        });
}


function createDashDivElements() {
    let o = []
    let i = 0
    let val = 43
    let dash = document.getElementById("dashRows");
    while (i < val) {
        if (i % 2 == 0) {
            let y = document.createElement("div");
            y.classList = "w3-row";
            let u = document.createElement("div");
            let q = document.createElement("div");
            u.classList = "w3-col s6 w3-center scene_element scene_element--fadeinup";
            q.classList = "w3-col s6 w3-center scene_element scene_element--fadeinup";

            divRowName = "dashDivRow" + i;
            divColName1 = "dashDivCol" + (i + 1);
            divColName2 = "dashDivCol" + (i + 2);

            y.id = divRowName;
            u.id = divColName1;
            q.id = divColName2;

            u.style.height = "400px"
            q.style.height = "400px"

            y.appendChild(u);
            y.appendChild(q);
            dash.appendChild(y);

            o.push(divColName1);
            o.push(divColName2);
            i = i + 2;
        }
    }
    return o;
}

dashCharts()