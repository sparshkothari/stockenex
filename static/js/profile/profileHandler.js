//profileHandler.js
function profileTabulator() {
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
            width:300,
            variableHeight: true
        },
    ]
    for (let e of Object.keys(userData)) {
        let i = new Object()
        if (e !="_id" && e !="symbols" && userData[e]) {
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