import {firebase} from "nativescript-plugin-firebase/firebase-common";

import {viewAfterLogIn} from "~/app_config";
import {navigateTo} from "~/utils/nav";
import {
    CreateUserOptions, FirebasePasswordLoginOptions,
    User as FirebaseUser,
    CreateUserResult as FirebaseCreatedUser
} from "nativescript-plugin-firebase/firebase"


export function authWithFacebook(): Promise<FirebaseUser> {
    return firebase.login({
        type: firebase.LoginType.FACEBOOK
    })

}

export function registerWithPassword(opts: CreateUserOptions): Promise<FirebaseCreatedUser> {
    return firebase.createUser({
        email: opts.email,
        password: opts.password
    })
}

export function loginWithPassword(opts: FirebasePasswordLoginOptions): Promise<FirebaseUser> {
    return firebase.login({
        type: firebase.LoginType.PASSWORD,
        passwordOptions: {
            email: opts.email,
            password: opts.password
        }
    })
}

export function redirectToViewAfterLogin() {
    let navTo = viewAfterLogIn;
    console.log("Navigating to " + navTo);
    navigateTo(navTo, true);
}
