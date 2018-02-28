import {EventData, Observable} from "tns-core-modules/data/observable";
import {bindingContextProperty} from "tns-core-modules/ui/core/view-base";
import {setCurrency, userPreferredCurrency} from "~/app_config"
import {metadataForCurrency} from "~/expense/common/form_properties_json";
import {RadDataForm} from "nativescript-ui-dataform";
import * as dialogs from "ui/dialogs";
import {navigateTo} from "~/utils/nav";

let settingsData;
let page;
let dataform: RadDataForm;

export function navigatingTo(args: EventData) {
    page = args.object;
    dataform = page.getViewById("settings-form");
    settingsData = {
        currency: userPreferredCurrency,
    };

    page.bindingContext = {
        settingsData: settingsData,
        metadata: {
            propertyAnnotations: [

                metadataForCurrency({includeGroup: false, displayName: "Preferred currency",})
            ]
        }
    }
}

export function saveTapped() {
    dataform.validateAndCommitAll().then((ok) => {
        if (ok) {
            try {
                applySettings()
                navigateTo({path: "expense/list/list"})
            } catch (err) {
                console.dir(err);
                dialogs.alert("Failed to save settings")
            }
        }
    })
}

function applySettings() {
    setCurrency(settingsData.currency)
    console.log("settings applied")
    console.dir(settingsData)
}