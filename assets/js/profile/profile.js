function profileInit() {
    profileTabulator()
}
function upgradeSubscriptionOP(subscriptionType) {
    subscriptionHandler(subscriptionType);
}
function subscripInit() {
    let freeS_b = document.getElementById('freeS');
    let basicS_b = document.getElementById('basicS');
    let premiumS_b = document.getElementById('premiumS');
    let platinumS_b = document.getElementById('platinumS');
    freeS_b.addEventListener("click", function() {
        upgradeSubscriptionOP("FreeSubscription")
    }, false);
    basicS_b.addEventListener("click", function() {
        upgradeSubscriptionOP("BasicSubscription")
    }, false);
    premiumS_b.addEventListener("click", function() {
        upgradeSubscriptionOP("PremiumSubscription")
    }, false);
    platinumS_b.addEventListener("click", function() {
        upgradeSubscriptionOP("PlatinumSubscription")
    }, false);
}
localStorage.setItem("userData", JSON.stringify(userDataFromMongo, null, 2));
subscripInit()
profileInit()