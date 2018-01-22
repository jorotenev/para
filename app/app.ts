// import "./_bundle-config";
import * as app from 'application';
import firebase = require("nativescript-plugin-firebase");
import {readableTimestamp} from "~/utils/time";
import {expenseAmountToString} from "~/utils/money";
import {viewLogIn, viewAfterLogIn} from '~/app_config';
import {numberConverter} from "~/utils/number"
import {navigateTo} from "~/utils/nav";

firebase.init({
    onAuthStateChanged: function (data) { // optional but useful to immediately re-logon the user when he re-visits your app
        console.log(data.loggedIn ? "Logged in to firebase" : "Logged out from firebase");
        if (data.loggedIn) {
            console.log("in app.ts.  user's email address: " + (data.user.email ? data.user.email : "N/A"));
            navigateTo(viewAfterLogIn)
        } else {
            console.log("in app.ts. user is not logged in")
        }

        firebase.getAuthToken({}).then(
            function (token) {
                console.log("Auth token retrieved: " + token);
            },
            function (errorMessage) {
                console.log("Auth token retrieval error: " + errorMessage);
            }
        );
    }
});

// https://docs.nativescript.org/core-concepts/data-binding#example-7-adding-converters-in-the-application-module-resources
app.setResources({
    'numberConverter': numberConverter,
    'readableTimestamp': readableTimestamp,
    'expenseAmountToString': expenseAmountToString,
});


app.start({moduleName: viewLogIn});