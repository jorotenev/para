import {navigateTo} from "~/utils/nav";
import {EventData} from "tns-core-modules/data/observable";
import {RadDataForm} from "nativescript-ui-dataform";
import {Page} from "tns-core-modules/ui/page";
import {
    authWithFacebook,
    refreshUserCofigAndRedirectToViewAfterLogin,
    registerWithPassword
} from "~/auth/common/firebase_auth";
import {SignUpViewModel} from "./signup-view-model"
import {USER_CONFIG} from "~/app_config";
import {CreateUserResult} from "nativescript-plugin-firebase";
import {hideKeyboard} from "~/utils/ui";

var dialogs = require("ui/dialogs");

let dataform: RadDataForm;
let page: Page;
let model: SignUpViewModel;

export function navigatingTo(args: EventData) {
    hideKeyboard()

    page = <Page> args.object;
    dataform = <RadDataForm> page.getViewById('signup-form');
    model = new SignUpViewModel();

    page.bindingContext = model
}

export function signupBtnPressed() {
    hideKeyboard()
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
        .then((formData) => {
            return new Promise<{ user: CreateUserResult, preferredCurrency: string }>((resolve, reject) => {
                registerWithPassword({email: formData.email, password: formData.password}).then((user) => {
                    resolve({
                        user: user,
                        preferredCurrency: formData.preferredCurrency
                    })
                }, reject)
            })
        })
        .then((obj) => {
            let createdUserInfo: CreateUserResult = obj.user;
            let currency = obj.preferredCurrency;
            console.log("created user:");
            console.dir(createdUserInfo);

            refreshUserCofigAndRedirectToViewAfterLogin({uid: createdUserInfo.key})
            USER_CONFIG.getInstance().userPreferredCurrency = currency
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

    authWithFacebook().then(refreshUserCofigAndRedirectToViewAfterLogin, (err) => {
        model.activity = false;
        dialogs.alert("Failed to register you :(")


    })
}

export function goToLogin() {
    navigateTo({path: "auth/login/login-view"})
}

