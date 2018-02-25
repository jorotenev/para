// import "./_bundle-config";
import * as app from 'application';
import {readableTimestamp} from "~/utils/time";
import {expenseAmountToString} from "~/utils/money";
import {viewLogIn} from '~/app_config';
import {numberConverter} from "~/utils/number";
import firebase = require("nativescript-plugin-firebase");

const localize = require("nativescript-localize");

firebase.init();

// https://docs.nativescript.org/core-concepts/data-binding#example-7-adding-converters-in-the-application-module-resources
app.setResources({
    'numberConverter': numberConverter,
    'readableTimestamp': readableTimestamp,
    'expenseAmountToString': expenseAmountToString,
    'L':localize
});


app.start({moduleName: viewLogIn});