// import "./_bundle-config";
import * as app from 'application';
import firebase = require("nativescript-plugin-firebase");
import {ValueConverter} from "tns-core-modules/ui/core/bindable";
var appSettings = require("application-settings");


firebase.init({
    // Optionally pass in properties for database, authentication and cloud messaging,
    // see their respective docs.
    onAuthStateChanged: function (data) { // optional but useful to immediately re-logon the user when he re-visits your app
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

let numberConverter: ValueConverter = {
    toView: function (val) {
        return val;
    },
    toModel: function (val) {
        return Number(val)
    }
};


// https://docs.nativescript.org/core-concepts/data-binding#example-7-adding-converters-in-the-application-module-resources
app.setResources({
    'numberConverter': numberConverter
});

const viewLogIn = 'auth/login-view';
const viewAfterLogIn = 'expense/add/add-expense';
// const viewAfterLogIn = 'expense/list/list';

appSettings.setString('start-view', viewAfterLogIn);

app.start({moduleName: viewLogIn});