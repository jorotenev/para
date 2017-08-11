import {Observable} from "data/observable";

export class User extends Observable {

    private email: string = "";
    private password: string = "";
    private name: string = "";


    constructor(email?: string, password?: string, name?: string) {
        super();
        this.email = email;
        this.password = password;
        this.name = name;
    }

    // You can add properties to observables on creation


    public login() {
        console.log(
            `Username ${this.name}, 
            user email ${this.email}
            user pass ${this.password}`
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

