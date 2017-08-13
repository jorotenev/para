import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {LoginViewModel} from './login-view-model';

let loginModel = new LoginViewModel();

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;

    page.bindingContext = loginModel;
}

export function emailPassLoginBtnPressed() {
    loginModel.login()

}


export function onFbLoginBtnPressed() {
    console.log("FB btn pressed");
}