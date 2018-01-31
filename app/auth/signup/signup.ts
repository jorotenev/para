import {navigateTo} from "~/utils/nav";
import {EventData} from "tns-core-modules/data/observable";
import {IUser} from "~/models/user-model";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {Page} from "tns-core-modules/ui/page";
import {authWithFacebook, redirectToViewAfterLogin, registerWithPassword} from "~/auth/common/firebase_auth";
import {SignUpViewModel} from "./signup-view-model"

var dialogs = require("ui/dialogs");

let dataform: RadDataForm;
let page: Page;
let model: SignUpViewModel;

export function navigatingTo(args: EventData) {
    page = <Page> args.object;
    dataform = <RadDataForm> page.getViewById('signup-form');
    model = new SignUpViewModel();

    page.bindingContext = model
}

export function signupBtnPressed() {
    const rejectedDataFormMsg = "rejected dataform promise";
    model.activity = true;

    dataform.validateAndCommitAll()
        .then((ok) => {
            if (ok) {
                return JSON.parse(dataform.editedObject);
            } else {
                throw new Error(rejectedDataFormMsg)
            }
        })
        .then((formData: IUser) => {
            return registerWithPassword({email: formData.email, password: formData.password})
        })
        .then((createdUserInfo) => {
            console.log("created user:");
            console.dir(createdUserInfo);

            redirectToViewAfterLogin()
        })
        .catch((reason) => {
            if (reason instanceof Error) {
                reason = reason.message
            }

            model.activity = false;

            let msg;
            if (reason.indexOf(rejectedDataFormMsg) !== -1) {
                // the UI have been updated by RadDataForm itself to notify the user about form errors
                return
            } else if (reason.indexOf("FirebaseAuthUserCollisionException") !== -1) {
                msg = "User with the same email already exists. " +
                    "Possibly you've already registered or you've signed up via Facebook?"
            } else {
                msg = "Failed to register you "
            }
            dialogs.alert(msg)
        });

}

export function withFb() {
    model.activity = true;

    authWithFacebook().then(redirectToViewAfterLogin, (err) => {
        model.activity = false;
        dialogs.alert("Failed to register you :(")


    })
}

export function goToLogin() {
    navigateTo("auth/login/login-view")
}

