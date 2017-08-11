/*
 In NativeScript, the app.ts file is the entry point to your application.
 You can use this file to perform app-level initialization, but the primary
 purpose of the file is to pass control to the app’s first module.
 */

import "./_bundle-config";
import * as app from 'application';
import firebase = require("nativescript-plugin-firebase");

firebase.init({
    // Optionally pass in properties for database, authentication and cloud messaging,
    // see their respective docs.
    onAuthStateChanged: function(data) { // optional but useful to immediately re-logon the user when he re-visits your app
        console.log(data.loggedIn ? "Logged in to firebase" : "Logged out from firebase");
        if (data.loggedIn) {
            console.log("user's email address: " + (data.user.email ? data.user.email : "N/A"));
        }
    }
}).then(
    (instance) => {
        console.log("firebase.init done");
    },
    (error) => {
        console.log("firebase.init error: " + error);
    }
);


app.start({moduleName: 'auth/login-view'});

/*
 Do not place any code after the application has been started as it will not
 be executed on iOS.
 */
