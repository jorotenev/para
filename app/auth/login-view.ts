import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {LoginViewModel} from './login-view-model';
import firebase = require("nativescript-plugin-firebase");
import {navigateTo} from "../utils/nav";
let appSettings = require("application-settings");

let loginModel = new LoginViewModel();


export function navigatingTo(args: EventData) {
    if (firebase.getCurrentUser()) {
        navigateTo(appSettings.getString("start-view", true))
    }
    let page = <Page>args.object;

    page.bindingContext = loginModel;
}

export function emailPassLoginBtnPressed() {
    loginModel.loginWithEmailAndPassword()

}

export function onFbLoginBtnPressed() {
    loginModel.loginWithFacebook();
}