import {EventData, Observable} from "tns-core-modules/data/observable";
import {USER_CONFIG} from "~/app_config"
import {metadataForCurrency} from "~/expense/common/form_properties_json";
import {RadDataForm} from "nativescript-ui-dataform";
import * as dialogs from "ui/dialogs";
import {navigateTo} from "~/utils/nav";
import {passwordMetadata} from "~/auth/common/common";
import * as firebase from "nativescript-plugin-firebase"
import {ObservableProperty} from "~/utils/misc";
import {hideKeyboard} from "~/utils/ui";
import {localize as l} from "nativescript-localize";
import {group_1} from "~/expense/common/common";

let settingsSourceObject: { currency: string, useShortDateFormat: boolean };
let changePassSourceObject: { oldPassword: string, password: string, confirmPassword: string };
let page;
let settingsDataform: RadDataForm;
let changePassDataform: RadDataForm;
let viewModel: SettingsVM;

export function navigatingTo(args: EventData) {
    hideKeyboard();

    page = args.object;
    settingsDataform = page.getViewById("settings-form");
    changePassDataform = page.getViewById("change-password-form");
    settingsSourceObject = {
        currency: USER_CONFIG.getInstance().userPreferredCurrency,
        useShortDateFormat: USER_CONFIG.getInstance().userPrefersShortDateFormat
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

    @ObservableProperty()
    public passwordChanging: boolean = false;

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
                {
                    editor: "Switch",
                    displayName: l('settings_relative_date'),
                    name: 'useShortDateFormat',
                    index: 0
                },
                metadataForCurrency({includeGroup: false, displayName: l('preferred_currency'),})
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
                passwordMetadata({index: 0, name: "oldPassword", hintText: l("current_password"), displayName: " "}),
                passwordMetadata({index: 1, name: "password", hintText: l("new_password"), displayName: " "}),
                passwordMetadata({
                    index: 2,
                    name: "confirmPassword",
                    hintText: l("confirm_password"),
                    displayName: " "
                }),
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
            password2.errorMessage = l("passwords_dont_match");
            validationResult = false;
        }
    }

    args.returnValue = validationResult;
}

export function onChangePassBtn() {
    changePassDataform.validateAndCommitAll().then(ok => {
        if (ok) {
            viewModel.passwordChanging = true
            firebase.getCurrentUser().then(user => {
                firebase.changePassword({
                    email: user.email,
                    oldPassword: changePassSourceObject.oldPassword,
                    newPassword: changePassSourceObject.password
                }).then(
                    function () {
                        viewModel.passwordChanging = false

                        // called when password change was successful
                        dialogs.alert(l('success_change_password'));
                        navigateTo({path: "expense/list/list"})
                    },
                    function (errorMessage) {
                        viewModel.passwordChanging = false

                        console.log(errorMessage);
                        dialogs.alert(l("failed_change_password"));
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
    USER_CONFIG.getInstance().userPrefersShortDateFormat = settingsSourceObject.useShortDateFormat;
    console.log("settings applied");
    console.dir(settingsSourceObject);
}