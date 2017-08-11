import {EventData} from 'data/observable';
import {Page} from 'ui/page';
import {User} from '../models/user-model';

let user = new User();

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;

    page.bindingContext = user;
}

export function logIn() {
    console.log('logging in in login-view');
    console.dir(user);
}

export function onFbLoginBtnPressed() {
    console.log("FB btn pressed");
}