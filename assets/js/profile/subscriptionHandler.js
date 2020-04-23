function subscriptionHandler(subscriptionType) {
    if (!confirm("Are you sure you want to modify or upgrade your subscription?")) {
        return;
    }
    $.post("/subscription",
    {
        subscriptionType: subscriptionType
    })
    .done(function(data, status){
        localStorage.setItem("userData", data);
        profileTabulator()
    });
}