import {navigateTo} from "~/utils/nav";
import {EventData, Observable} from "tns-core-modules/data/observable";
import {IUser, User} from "~/models/user-model";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {Page} from "tns-core-modules/ui/page";
import {generateEmailPasswordMetadata} from "~/auth/common/common";
import {onFbLoginBtnPressed} from "~/auth/login/login-view";
import {ObservableProperty} from "~/utils/misc";

let dataform: RadDataForm;
let page: Page;

export function navigatingTo(args: EventData) {

    page = <Page> args.object;
    dataform = <RadDataForm> page.getViewById('signup-form')
    page.bindingContext = new SignUpViewModel();
}

export function signupBtnPressed() {
    dataform.validateAndCommitAll().then((ok) => {
        if (ok) {
            let user = JSON.parse(dataform.editedObject);
        } else {
            console.log("rejected dataform promise")
        }
    }, (err) => {
        console.log("rejected")
    })
}

export let withFb = onFbLoginBtnPressed;

export function goToLogin() {
    navigateTo("auth/login/login-view")
}


class SignUpViewModel extends Observable {

    public user;
    @ObservableProperty()
    public activity: boolean;

    constructor() {

        super()
        this.activity = false;
        this.user = {email: null, password: null}
    }


    get metadata() {
        return generateEmailPasswordMetadata()
    }
}