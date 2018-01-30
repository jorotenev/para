import {Observable} from "data/observable";

export interface IUser {
    email: string,
    password: string;
}

export class User implements IUser {


    constructor(public email: string, private _password: string) {
    }

    static makeEmptyUserModel(): IUser {
        return {
            password: null,
            email: null,
        }
    }

    get password() {
        return this._password
    }

    set password(pwd: string) {
        this._password = pwd;
    }

    public login() {
    };

    public register() {
        console.log("Registering")
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

