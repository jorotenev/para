import {EventData, Observable} from "tns-core-modules/data/observable";
import {USER_CONFIG} from "~/app_config"
import {metadataForCurrency} from "~/expense/common/form_properties_json";
import {RadDataForm} from "nativescript-ui-dataform";
import * as dialogs from "ui/dialogs";
import {navigateTo} from "~/utils/nav";
import {passwordMetadata} from "~/auth/common/common";
import * as firebase from "nativescript-plugin-firebase"
import {ObservableProperty} from "~/utils/misc";

let settingsSourceObject: { currency: string };
let changePassSourceObject: { oldPassword: string, password: string, confirmPassword: string };
let page;
let settingsDataform: RadDataForm;
let changePassDataform: RadDataForm;
let viewModel: SettingsVM;

export function navigatingTo(args: EventData) {
    page = args.object;
    settingsDataform = page.getViewById("settings-form");
    changePassDataform = page.getViewById("change-password-form");
    settingsSourceObject = {
        currency: USER_CONFIG.getInstance().userPreferredCurrency,
    };
    changePassSourceObject = {
        oldPassword: null,
        password: null,
        confirmPassword: null
    };
    viewModel = new SettingsVM();
    page.bindingContext = viewModel
}

class SettingsVM extends Observable {
    @ObservableProperty()
    public showChangePassword: boolean = false;

    constructor() {
        super();
        firebase.getCurrentUser().then(user => {
            let isAccountWithPassword = user.providers.filter(provider => provider.id === "password").length === 1;
            if (isAccountWithPassword) {
                this.showChangePassword = true
            }
        })
    }

    public get settingsMetadata() {
        return {
            propertyAnnotations: [
                metadataForCurrency({includeGroup: false, displayName: "Preferred currency",})
            ]
        }
    }

    public get settingsObject() {
        return settingsSourceObject
    }

    public get changePassSourceObject() {
        return changePassSourceObject
    }

    public get changePassMetadata() {
        return {
            propertyAnnotations: [
                passwordMetadata({index: 0, name: "oldPassword", hintText: "Current password", displayName: " "}),
                passwordMetadata({index: 1, name: "password", hintText: "New password", displayName: " "}),
                passwordMetadata({index: 2, name: "confirmPassword", hintText: "Confirm password", displayName: " "}),
            ]
        }
    }


}

export function passwordValidate(args) {
    console.log("validating ");
    let validationResult = true;

    if (args.propertyName == "confirmPassword") {
        let dataForm = args.object;
        let password1 = dataForm.getPropertyByName("password");
        let password2 = args.entityProperty;
        console.log(`validating passwords ${password1.valueCandidate} ${password2.valueCandidate}`)

        if (password1.valueCandidate != password2.valueCandidate) {
            password2.errorMessage = "Passwords do not match.";
            validationResult = false;
        }
    }

    args.returnValue = validationResult;
}

export function onChangePassBtn() {
    changePassDataform.validateAndCommitAll().then(ok => {
        if (ok) {
            firebase.getCurrentUser().then(user => {
                firebase.changePassword({
                    email: user.email,
                    oldPassword: changePassSourceObject.oldPassword,
                    newPassword: changePassSourceObject.password
                }).then(
                    function () {
                        // called when password change was successful
                        dialogs.alert("Successfully changed your password.");
                        navigateTo({path: "expense/list/list"})
                    },
                    function (errorMessage) {
                        console.log(errorMessage);
                        dialogs.alert("Couldn't change your password. Make sure you entered your correct current password");

                    }
                );
            })


        }
    })
}

export function saveSettingsTapped() {
    settingsDataform.validateAndCommitAll().then((ok) => {
        if (ok) {
            try {
                applySettings();
                navigateTo({path: "expense/list/list"})
            } catch (err) {
                console.dir(err);
                dialogs.alert("Failed to save settings")
            }
        }
    })
}

function applySettings() {
    USER_CONFIG.getInstance().userPreferredCurrency = settingsSourceObject.currency;
    console.log("settings applied");
    console.dir(settingsSourceObject);
}