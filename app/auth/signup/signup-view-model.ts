import {metadataForCurrency} from "~/expense/common/form_properties_json";
import {ObservableProperty} from "~/utils/misc";
import {Observable} from "tns-core-modules/data/observable";
import {generateEmailPasswordMetadata} from "~/auth/common/common";
import {defaultCurrency} from "~/app_config";
import {localize as l} from "nativescript-localize"
export class SignUpViewModel extends Observable {

    public user;
    @ObservableProperty()
    public activity: boolean;

    constructor() {
        super();
        this.activity = false;
        this.user = {email: null, password: null, preferredCurrency: defaultCurrency}
    }


    get metadata() {
        let metadata = generateEmailPasswordMetadata();
        console.log("props len is  " + metadata.propertyAnnotations.length)
        let currencyMetadata = metadataForCurrency({
            index: metadata.propertyAnnotations.length,
            name: 'preferredCurrency',
            displayName: l("preferred_currency")
        });
        metadata.propertyAnnotations.push(currencyMetadata);
        return metadata
    }
}