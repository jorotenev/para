import {Observable} from "data/observable";
import firebase = require("nativescript-plugin-firebase");
import {navigateTo} from "../utils/nav";
import {viewAfterLogIn} from "~/app_config";
var dialogs = require("ui/dialogs");
var appSettings = require("application-settings");

export class LoginViewModel extends Observable {
    email: string;
    password: string;

    constructor(email: string = '', password: string = '') {
        super();
        this.email = email;
        this.password = password;
    }

    public loginWithEmailAndPassword() {


        console.log('logging in login-view');
        console.log(this);

        firebase.login({
            type: firebase.LoginType.PASSWORD,
            passwordOptions: {
                email: this.email,
                password: this.password
            }
        }).then(
            function (result) {
                let r = JSON.stringify(result);
                onSuccessfulLogin()
            },
            function (errorMessage) {
                console.log(errorMessage);
            }
        );
    }

    public loginWithFacebook() {
        firebase.login({
            type: firebase.LoginType.FACEBOOK
        }).then(
            function (result) {
                dialogs.alert({
                    title: "Login OK",
                    message: JSON.stringify(result),
                    okButtonText: "Nice!"
                });
                onSuccessfulLogin();
            },
            function (errorMessage) {
                dialogs.alert({
                    title: "Login error",
                    message: errorMessage,
                    okButtonText: "OK, pity"
                });
            }
        );
    }
}

function onSuccessfulLogin() {
    let navTo = viewAfterLogIn;
    console.log("Navigating to " + navTo);
    navigateTo(navTo, true);
}
