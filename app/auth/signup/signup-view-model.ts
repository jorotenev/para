import {metadataForCurrency} from "~/expense/common/form_properties_json";
import {ObservableProperty, propertyOf} from "~/utils/misc";
import {IUser, User} from "~/models/user-model";
import {Observable} from "tns-core-modules/data/observable";
import {generateEmailPasswordMetadata} from "~/auth/common/common";

export class SignUpViewModel extends Observable {

    public user;
    @ObservableProperty()
    public activity: boolean;

    constructor() {
        super();
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