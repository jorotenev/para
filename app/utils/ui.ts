import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";

import * as app from 'application';

import {isAndroid} from 'platform';

export function toggleActivityIndicator(component: ActivityIndicator, state: boolean) {
    //todo refactor - can include this logic in the XML and use an observable
    component.busy = state;
    component.visibility = state ? 'visible' : 'collapse'
}

declare let android;

/**
 * https://bradmartin.net/2016/10/21/dismiss-the-android-softkeyboard-programmatically-in-a-nativescript-app/comment-page-1/
 */
export function hideKeyboard() {
    if (isAndroid) {
        try {
            let activity = app.android.foregroundActivity;
            let Context = app.android.currentContext;
            let inputManager = Context.getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
            inputManager.hideSoftInputFromWindow(activity.getCurrentFocus().getWindowToken(), android.view.inputmethod.InputMethodManager.HIDE_NOT_ALWAYS);
        } catch (err) {
            console.log(err);
        }
    }
}