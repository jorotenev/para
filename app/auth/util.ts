const firebase = require("nativescript-plugin-firebase");
import {DataStore} from "~/expense_datastore/datastore"

export function logout(): Promise<void> {
    DataStore.resetDataStore()
    return firebase.logout()
}