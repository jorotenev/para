import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {LoginViewModel} from './login-view-model';
import {navigateTo} from "~/utils/nav";
import {RadDataForm} from "nativescript-ui-dataform";
import {firebase} from "nativescript-plugin-firebase/firebase-common";
import {authWithFacebook, refreshUserCofigAndRedirectToViewAfterLogin} from "~/auth/common/firebase_auth";
import {hideKeyboard} from "~/utils/ui";

const l = require("nativescript-localize");
const dialogs = require("ui/dialogs");

let dataform: RadDataForm;
let page: Page;
let loginModel;

export function navigatingTo(args: EventData) {
    firebase.getCurrentUser().then(refreshUserCofigAndRedirectToViewAfterLogin, () => {
        loginModel.activity = false
    });
    page = <Page>args.object;
    dataform = <RadDataForm>page.getViewById('login-form');
    loginModel = new LoginViewModel();


    loginModel.activity = true;
    page.bindingContext = loginModel;
}


export function emailPassLoginBtnPressed() {
    hideKeyboard();
    dataform.validateAndCommitAll().then((ok) => {
        if (ok) {
            loginModel.loginWithEmailAndPassword()
                .then(refreshUserCofigAndRedirectToViewAfterLogin)
                .catch((errorMessage) => {
                    if (errorMessage instanceof Error) {
                        errorMessage = errorMessage.message
                    }
                    let msgToShow;
                    if (errorMessage.indexOf("FirebaseAuthInvalidUserException") !== -1) {
                        msgToShow = l("no_usr_provided_credentials")
                    } else if (errorMessage.indexOf("FirebaseAuthInvalidCredentialsException") !== -1) {
                        msgToShow = l('auth_invalid_pass')
                    } else {
                        msgToShow = l("problem_logging_in")
                    }
                    // TODO make it more informative
                    dialogs.alert(msgToShow)
                })
        } else {
            console.log("validation failed")
        }
    })
}


export function onFbLoginBtnPressed() {
    authWithFacebook().then(refreshUserCofigAndRedirectToViewAfterLogin, (err) => {
        dialogs.alert({
            title: l("problem_logging_in"),
            message: err,
            okButtonText: "Ok"
        });
    })
}

export function goToSignUp() {
    navigateTo({path: 'auth/signup/signup'})
}

export function goToRecoverPassword() {
    navigateTo({path: 'auth/recover_password/recover_password'})
}