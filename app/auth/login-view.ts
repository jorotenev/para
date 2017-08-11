import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {User} from '../models/user-model';
import firebase = require("nativescript-plugin-firebase");

let user = new User();

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;

    page.bindingContext = user;
}

export function emailPassLoginBtnPressed() {
    console.log('logging in in login-view');
    console.log(user);

    firebase.login({
        type: firebase.LoginType.PASSWORD,
        passwordOptions: {
            email: user.email,
            password: user.password
        }
    }).then(
        function (result) {
            let r = JSON.stringify(result);
            console.log("LOGGED IN!");
            console.log(r)
        },
        function (errorMessage) {
            console.log(errorMessage);
        }
    );
}

export function onFbLoginBtnPressed() {
    console.log("FB btn pressed");
}