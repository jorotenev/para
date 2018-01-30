import {navigateTo} from "~/utils/nav";
import {EventData, Observable} from "tns-core-modules/data/observable";
import {IUser, User} from "~/models/user-model";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {Page} from "tns-core-modules/ui/page";
import {generateEmailPasswordMetadata} from "~/auth/common/common";
import {onFbLoginBtnPressed} from "~/auth/login/login-view";
import {ObservableProperty, propertyOf} from "~/utils/misc";
import {metadataForCurrency} from "~/expense/common/form_properties_json";
import {userPreferredCurrency} from "~/app_config";

var dialogs = require("ui/dialogs");

let dataform: RadDataForm;
let page: Page;

export function navigatingTo(args: EventData) {

    page = <Page> args.object;
    dataform = <RadDataForm> page.getViewById('signup-form')
    page.bindingContext = new SignUpViewModel();
}

export function signupBtnPressed() {
    let rejectedDataFormMsg = "rejected dataform promise";

    dataform.validateAndCommitAll()
        .then((ok) => {
            if (ok) {
                return JSON.parse(dataform.editedObject);
            } else {
                throw new Error(rejectedDataFormMsg)
            }
        })
        .then((formData: IUser) => {
            let u: User = new User({
                email: formData.email,
                password: formData.password,
                preferredCurrency: formData.preferredCurrency
            })
            return u.register() //it's a promise
        })
        .then(() => {
            navigateTo('expense/add/add-expense', true)
        }).catch((reason) => {
        if (reason.indexOf(rejectedDataFormMsg) !== -1) {
            return
        } else {
            dialogs.alert("Failed to register you :(")
        }
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
        this.user = User.emptyUser()
    }


    get metadata() {
        let metadata = generateEmailPasswordMetadata();
        console.log("props len is  " + metadata.propertyAnnotations.length)
        let currencyMetadata = metadataForCurrency({
            index: metadata.propertyAnnotations.length,
            name: propertyOf<IUser>('preferredCurrency'),
            displayName: "Preferred currency"
        });
        metadata.propertyAnnotations.push(currencyMetadata);
        return metadata
    }
}