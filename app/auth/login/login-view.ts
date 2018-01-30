import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {LoginViewModel} from './login-view-model';
import {navigateTo} from "~/utils/nav";
import {RadDataForm} from "nativescript-pro-ui/dataform";

let dataform: RadDataForm;
let page: Page;
let loginModel;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    dataform = <RadDataForm>page.getViewById('login-form');

    loginModel = new LoginViewModel();
    page.bindingContext = loginModel;
}


export function emailPassLoginBtnPressed() {
    dataform.validateAndCommitAll().then((ok) => {
        if (ok) {
            loginModel.loginWithEmailAndPassword()
        }
    })

}


export function onFbLoginBtnPressed() {
    loginModel.loginWithFacebook();
}

export function goToSignUp() {
    navigateTo('auth/signup/signup')
}