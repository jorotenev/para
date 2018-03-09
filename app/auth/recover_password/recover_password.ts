import {emailMetadata} from "~/auth/common/common";
import {RadDataForm} from "nativescript-ui-dataform";
import {EventData} from "tns-core-modules/data/observable";
import * as firebase from "nativescript-plugin-firebase"
import {navigateTo} from "~/utils/nav";

var dialogs = require("ui/dialogs");
const l = require("nativescript-localize");

let recoverPassVM: RecoverPasswordVM;
let page;
let dataForm;

export function navigatingTo(args: EventData) {
    page = args.object;
    recoverPassVM = new RecoverPasswordVM();
    dataForm = <RadDataForm> page.getViewById('recover-pass-form');
    page.bindingContext = recoverPassVM
}

export function onRecoverBtn() {
    dataForm.validateAndCommitAll().then((ok) => {
        if (!ok) return;
        let email = recoverPassVM.source_object.email;
        firebase.resetPassword({
            email: email
        }).then(
            function () {
                dialogs.alert({
                    title: l("recover_password"),
                    message: l("check_mail_instruction"),
                    okButtonText: "Ok"
                })
                navigateTo({path: "auth/login/login-view", clearHistory: true})
            },
            function (errorMessage) {
                dialogs.alert({
                    title: l("recover_password"),
                    message: l("no_acc_for_mail", email) + ` ${email}`,
                    okButtonText: "Ok"
                })
            }
        );
    })
}

class RecoverPasswordVM {
    public source_object;

    constructor() {
        this.source_object = {
            email: null
        }
    }

    public get metadata() {
        let metadata = emailMetadata();
        return {
            commitMode: "Immediate",
            validationMode: "Immediate",
            propertyAnnotations: [metadata]
        }
    }
}