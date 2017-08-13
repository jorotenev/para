import {Observable} from "data/observable";
import firebase = require("nativescript-plugin-firebase");
let frameModule = require("tns-core-modules/ui/frame");

export class LoginViewModel extends Observable {
    email: string;
    password: string;

    constructor(email: string = '', password: string = '') {
        super();
        this.email = email;
        this.password = password;
    }

    public login() {
        navigateTo('expense/add-expense');
        return;
        // console.log('logging in in login-view');
        // console.log(this);
        //
        // firebase.login({
        //     type: firebase.LoginType.PASSWORD,
        //     passwordOptions: {
        //         email: this.email,
        //         password: this.password
        //     }
        // }).then(
        //     function (result) {
        //         let r = JSON.stringify(result);
        //
        //         console.log("LOGGED IN!");
        //         console.log(r);
        //
        //
        //     },
        //     function (errorMessage) {
        //         console.log(errorMessage);
        //     }
        // );
    }
}
function navigateTo(path: string) {
    let topmost = frameModule.topmost();
    topmost.navigate({
        moduleName: path,
        clearHistory: true
    });
}