document.getElementById("submit").addEventListener("click", function() {
    $.post("/register",

            {
                name: document.getElementById("name").value,
                username: document.getElementById("username").value,
                password: document.getElementById("password").value,
                email: document.getElementById("email").value

            }
        )
        .done(function(data, status) {
            vex.dialog.buttons.YES.text = "Okay";
            //vex.dialog.alert('You successfully created an account!')

            vex.dialog.alert({
                message: 'You successfully created an account!',
                callback: function(value) {
                     window.location.href = "/profile"

                }

            })
        })
        .fail(function() {
            //console.log("fail")
            vex.dialog.buttons.YES.text = "Okay";
            vex.dialog.alert('The chosen username is already registered.')

        });


    console.log("HERE")


}, false);