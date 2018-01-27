const firebase = require("nativescript-plugin-firebase");

export function logout(): Promise<void> {
    return firebase.logout()
}