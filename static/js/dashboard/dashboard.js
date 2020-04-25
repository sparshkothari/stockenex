function dashboardInit() {
    //var i = document.getElementById("userStocksTitleHeader")
    //i.textContent = JSON.parse(localStorage.getItem("userData"))["name"] + "'s " + "Stocks"
    dashboardStocks()
    stockColorKeyTabulator("stockColorKey")
    dashboardProfile()
}
dashboardInit()