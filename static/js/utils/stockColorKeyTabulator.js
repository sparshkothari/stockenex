//stockColorCodeKey.js



function stockColorKeyTabulator(divId) {
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
    SCT.hideColumn("Color")
}





/*
                <table class="table1 w3-table" style="font-size: large; font-family: BI">
                    <tr style="color:white;background-color:black; border: 2px solid #999;">
                        <th style="border-right: 2px solid #999">Color Key</th>
                        <th>Value</th>
                    </tr>
                    <tr style="background-color: #000080; color:white">
                        <td>Navy Blue</td>
                        <td>Short Entry Region</td>
                    </tr>
                    <tr style="background-color: #005f00; color:white">
                        <td>Dark Green</td>
                        <td>Long Entry Region</td>
                    </tr>
                    <tr style="background-color: #00ff00; color:black">
                        <td>Lime</td>
                        <td>Low Entry-Level Day</td>
                    </tr>
                    <tr style="background-color: #F664AF; color:black">
                        <td>Magenta</td>
                        <td>Profit Level 1</td>
                    </tr>
                    <tr style="background-color: #800080; color:white">
                        <td>Purple</td>
                        <td>Profit Level 2</td>
                    </tr>
                    <tr style="background-color: #FCE883; color:black">
                        <td>Yellow</td>
                        <td>Breakout Day</td>
                    </tr>
                    <tr style="background-color: #EE204D; color:black">
                        <td>Red</td>
                        <td>No Entry</td>
                    </tr>
                    <!-- here goes our data! -->
                </table>
*/