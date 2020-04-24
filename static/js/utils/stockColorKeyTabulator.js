//stockColorCodeKey.js



function stockColorKeyTabulator(divId) {
    let sctColumns = [ //Define Table Columns
        {
            title: "Key",
            field: "Key",
            hozAlign: "center",
            formatter: function(cell) {
                cell.getElement().style.height = "25px"
                return cell.getValue()
            }
        },
        {
            title: "Value",
            field: "Value",
            hozAlign: "center",
            formatter: function(cell) {
                cell.getElement().style.height = "25px"
                return cell.getValue()
            }
        },
        {
            title: "Color",
            field: "Color",
            hozAlign: "center",
            formatter: function(cell) {
                cell.getElement().style.height = "25px"
                return cell.getValue()

            }
        },
    ];
    let sctData = [
        { Key: "Navy Blue", Value: "Short Entry Region", Color: "#000080" },
        { Key: "Dark Green", Value: "Long Entry Region", Color: "#005f00" },
        { Key: "Lime", Value: "Low Entry-Level Day", Color: "#00ff00" },
        { Key: "Magenta", Value: "Profit Level 1", Color: "#F664AF" },
        { Key: "Purple", Value: "Profit Level 2", Color: "#800080" },
        { Key: "Yellow", Value: "Breakout Day", Color: "#FCE883" },
        { Key: "Red", Value: "No Entry", Color: "#EE204D" },
    ];
    var SCT = new Tabulator("#" + divId, {
        tooltips: function(cell) {
            return cell.getValue();
        },
        height: "205px",
        data: sctData,
        layout: "fitColumns",
        rowFormatter: function(row) {
            let c = row.getCell("Color").getValue();
            row.getElement().style.backgroundColor = c;
            if (c == "#000080" || c == "#005f00" || c == "#800080") {
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