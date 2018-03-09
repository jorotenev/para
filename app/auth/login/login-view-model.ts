import {Observable} from "data/observable";
import {generateEmailPasswordMetadata} from "~/auth/common/common";
import {ObservableProperty} from "~/utils/misc";
import {loginWithPassword} from "~/auth/common/firebase_auth";
import {User as FirebaseUser,} from "nativescript-plugin-firebase"

export class LoginViewModel extends Observable {
    public loginData;

    @ObservableProperty()
    public activity: boolean;

    constructor() {

        super();
        this.activity = false;
        this.loginData = {
            email: null,
            password: null
        }
    }


    get metadata() {
        return generateEmailPasswordMetadata()
    }


    public loginWithEmailAndPassword(): Promise<FirebaseUser> {
        const that = this;
        console.log('logging in login-view');
        this.activity = true;

        return loginWithPassword({email: this.loginData.email, password: this.loginData.password})
            .then(
                function (usr: FirebaseUser) {
                    that.activity = false;
                    return usr
                },
                function (errorMessage) {
                    console.log('rejected promise firebase' + errorMessage);
                    that.activity = false;
                    throw new Error(errorMessage)
                }
            );
    }
}

