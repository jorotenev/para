import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {LoginViewModel} from './login-view-model';
import {navigateTo} from "~/utils/nav";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {firebase} from "nativescript-plugin-firebase/firebase-common";
import {authWithFacebook, redirectToViewAfterLogin} from "~/auth/common/firebase_auth";

const dialogs = require("ui/dialogs");

let dataform: RadDataForm;
let page: Page;
let loginModel;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    dataform = <RadDataForm>page.getViewById('login-form');
    loginModel = new LoginViewModel();


    loginModel.activity = true;
    page.bindingContext = loginModel;

    firebase.getCurrentUser().then(() => {
        redirectToViewAfterLogin()
    }, () => {
        loginModel.activity = false
    })

}


export function emailPassLoginBtnPressed() {
    dataform.validateAndCommitAll().then((ok) => {
        if (ok) {
            loginModel.loginWithEmailAndPassword()
                .then(redirectToViewAfterLogin)
                .catch((errorMessage) => {
                    if (errorMessage instanceof Error) {
                        errorMessage = errorMessage.message
                    }
                    let msgToShow;
                    if (errorMessage.indexOf("FirebaseAuthInvalidUserException") !== -1) {
                        msgToShow = "No user with the provided credentials."
                    } else if (errorMessage.indexOf("FirebaseAuthInvalidCredentialsException") !== -1) {
                        msgToShow = "Invalid password. Maybe you entered a wrong password " +
                            "or you have registered with Facebook?"
                    } else {
                        msgToShow = "Problem logging you in"
                    }

                    // TODO make it more informative
                    dialogs.alert(msgToShow)
                })
        }
    })
}


export function onFbLoginBtnPressed() {
    authWithFacebook().then((result) => {
        // todo
        dialogs.alert({
            title: "Login OK",
            message: result.uid,
            okButtonText: "Nice!"
        });

    }, (err) => {
        dialogs.alert({
            title: "Login error",
            message: err,
            okButtonText: "OK, pity"
        });
    }).then(redirectToViewAfterLogin)
}

export function goToSignUp() {
    navigateTo('auth/signup/signup')
}