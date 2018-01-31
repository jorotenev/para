import {Observable} from "data/observable";
import {setUserFirebaseUID, userPreferredCurrency} from "~/app_config";
import {firebase} from "nativescript-plugin-firebase/firebase-common";

export interface IUser {
    email: string,
    password?: string;
    preferredCurrency: string;


}

interface UserConstructor {
    email: string
    password?: string
    preferredCurrency: string

}

export class User implements IUser {

    public email;
    private _password: string;
    public preferredCurrency: string;

    constructor(options: UserConstructor) {
        let opts = {
            email: options.email,
            password: null,
            preferredCurrency: userPreferredCurrency,
            ...options // override above defaults
        }
        this.email = opts.email
        this.password = opts.password
        this.preferredCurrency = opts.preferredCurrency

    }

    static emptyUser(): IUser {
        return {
            email: null,
            password: null,
            preferredCurrency: userPreferredCurrency
        }
    }

    get password() {
        return this._password
    }

    set password(pwd: string) {
        this._password = pwd;
    }

    public register(): Promise<string> {
        const that = this;
        return new Promise<string>(function (resolve, reject) {

        })
    };

    resetPassword() {
        console.log("Reset password")
    };

}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

