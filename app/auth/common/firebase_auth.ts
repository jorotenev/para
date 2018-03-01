import {firebase} from "nativescript-plugin-firebase/firebase-common";

import {APP_CONFIG, USER_CONFIG} from "~/app_config";
import {navigateTo} from "~/utils/nav";
import {
    CreateUserOptions,
    CreateUserResult as FirebaseCreatedUser,
    FirebasePasswordLoginOptions,
    User as FirebaseUser
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

/**
 * This funciton is called whenever a user successfully logs in
 * (regardless if it's via email+pass, fb or auto-signed in.)
 *
 * @param {FirebaseUser} user
 */
export function refreshUserCofigAndRedirectToViewAfterLogin(user: { uid: string }) {
    console.log("here")
    USER_CONFIG.resetSingleton(); // if there was a previously logged-in user
    USER_CONFIG.getInstance({user_id: user.uid}); // called for its side-effect

    let navTo = APP_CONFIG.getInstance().viewAfterLogIn;
    console.log("Navigating to " + navTo);
    navigateTo({path: navTo});
}
