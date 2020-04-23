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
                                            $.post("/symbol",
                                            {
                                                symbol: cell.getValue(),
                                                operation: operation
                                            })
                                            .done(function(data, status){
                                                localStorage.setItem("userData", data);
                                                dashboardProfile()
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
    if (symbols) {
        if (symbols.length > 0) {
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
            .done(function(data, status){
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
    }
}

function dashboardStocks() {
     $.get("/stock")
      .done(function(data, status){
        var data_ = data;
        dashboardStocksTabulator(data_);
    });
}