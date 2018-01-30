﻿// import "./_bundle-config";
import * as app from 'application';
import firebase = require("nativescript-plugin-firebase");
import {readableTimestamp} from "~/utils/time";
import {expenseAmountToString} from "~/utils/money";
import {viewLogIn} from '~/app_config';
import {numberConverter} from "~/utils/number"

firebase.init();

// https://docs.nativescript.org/core-concepts/data-binding#example-7-adding-converters-in-the-application-module-resources
app.setResources({
    'numberConverter': numberConverter,
    'readableTimestamp': readableTimestamp,
    'expenseAmountToString': expenseAmountToString,
});


app.start({moduleName: viewLogIn});