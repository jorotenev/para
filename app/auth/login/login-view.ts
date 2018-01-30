import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {LoginViewModel} from './login-view-model';
import {navigateTo} from "~/utils/nav";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {userFirebaseUID, viewAfterLogIn} from "~/app_config";
import {firebase} from "nativescript-plugin-firebase/firebase-common";

let dataform: RadDataForm;
let page: Page;
let loginModel;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    dataform = <RadDataForm>page.getViewById('login-form');
    loginModel = new LoginViewModel();


    loginModel.activity = true;
    page.bindingContext = loginModel;

    firebase.getCurrentUser().then((user) => {
        onSuccessfullyLogin()
    }, () => {
        loginModel.activity = false
    })

}

function onSuccessfullyLogin() {
    navigateTo(viewAfterLogIn)
}

export function emailPassLoginBtnPressed() {
    dataform.validateAndCommitAll().then((ok) => {
        if (ok) {
            loginModel.loginWithEmailAndPassword()
        }
    })

}

function tryToLogin(): Promise<void> {
    return new Promise<void>(function (resolve, reject) {

    })
}

export function onFbLoginBtnPressed() {
    loginModel.loginWithFacebook();
}

export function goToSignUp() {
    navigateTo('auth/signup/signup')
}