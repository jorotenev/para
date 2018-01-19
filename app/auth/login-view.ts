import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {LoginViewModel} from './login-view-model';
import firebase = require("nativescript-plugin-firebase");
import {navigateTo} from "../utils/nav";
import {viewAfterLogIn} from "~/app_config";

let loginModel = new LoginViewModel();


export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
    page.bindingContext = loginModel;
}


export function emailPassLoginBtnPressed() {
    loginModel.loginWithEmailAndPassword()

}


export function onFbLoginBtnPressed() {
    loginModel.loginWithFacebook();
}
