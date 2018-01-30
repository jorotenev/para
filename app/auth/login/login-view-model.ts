import {Observable} from "data/observable";
import firebase = require("nativescript-plugin-firebase");
import {navigateTo} from "~/utils/nav";
import {viewAfterLogIn} from "~/app_config";
import {generateEmailPasswordMetadata} from "~/auth/common/common";
import {ObservableProperty} from "~/utils/misc";

var dialogs = require("ui/dialogs");

export class LoginViewModel extends Observable {
    public loginData;

    @ObservableProperty()
    public activity: boolean;

    constructor() {

        super();
        this.activity = false;
        this.loginData = {
            email: null,
            password: null
        }
    }


    get metadata() {
        return generateEmailPasswordMetadata()
    }


    public loginWithEmailAndPassword() {

        const that = this;
        console.log('logging in login-view');
        this.activity = true;

        firebase.login({
            type: firebase.LoginType.PASSWORD,
            passwordOptions: {
                email: this.loginData.email,
                password: this.loginData.password
            }
        }).then(
            function (result) {
                let r = JSON.stringify(result);
                //TODO log this
                console.log(r)
                onSuccessfulLogin()
                that.activity = false;

            },
            function (errorMessage) {
                console.log('rejected promise firebase' + errorMessage);
                that.activity = false;

                if (errorMessage.indexOf("FirebaseAuthInvalidUserException") !== -1) {
                    dialogs.alert("No such user")
                } else if(errorMessage.indexOf("FirebaseAuthInvalidCredentialsException")!==-1){
                    dialogs.alert("Invalid password. Maybe you entered a wrong password " +
                        "or you have registered with Facebook?")
                } else {
                    dialogs.alert("Problem logging you in")
                }
            }
        );
    }

    public loginWithFacebook() {
        firebase.login({
            type: firebase.LoginType.FACEBOOK
        }).then(
            function (result) {
                // TODO
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
