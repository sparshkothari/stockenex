var Login = {
    init : function(){
        this.login();
    },
    login: function() {
        document.getElementById("submit").addEventListener("click", function() {
            $.post("/login",
                    {
                        username: document.getElementById("username").value,
                        password: document.getElementById("password").value,
                    }
                )
                .done(function(data, status) {
                    vex.dialog.buttons.YES.text = "Okay";

                    vex.dialog.alert({
                        message: 'You successfully logged in!',
                        callback: function(value) {
                            window.location.href = "/profile";

                        }

                    })
                })
                .fail(function() {
                    //console.log("fail")
                    vex.dialog.buttons.YES.text = "Okay";
                    vex.dialog.alert('Username or password is incorrect.');

                });




        }, false);

    }

}

Login.init()