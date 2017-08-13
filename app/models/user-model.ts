import {Observable} from "data/observable";

export interface IUser {
    email: string,
    password: string;
    name: string;
}
export class User extends Observable implements IUser {

    private _email: string = "";
    private _password: string = "";
    private _name: string = "";


    constructor(email?: string, password?: string, name?: string) {
        super();
        this._email = email;
        this._password = password;
        this._name = name;
    }

    // You can add properties to observables on creation

    public get email() {
        return this._email
    }

    public set email(email: string) {
        this._email = email;
    }

    public get password() {
        return this._password;
    }

    public set password(pass: string) {
        this._password = pass;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get name() {
        return this._name;
    }

    public login() {
        console.log(
            `Username ${this._name}, 
            user email ${this._email}
            user pass ${this._password}`
        );
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

