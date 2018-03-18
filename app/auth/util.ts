const firebase = require("nativescript-plugin-firebase");
import {DataStore} from "~/expense_datastore/datastore"
import {authObservable} from "~/auth/auth_event"

export function logout(): Promise<void> {
    let result = firebase.logout();
    authObservable.logoutOccurred();

    return result;
}