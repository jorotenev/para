import * as app from 'application';
import {readableTimestamp} from "~/utils/time";
import {expenseAmountToString} from "~/utils/money";
import {numberConverter} from "~/utils/number";
import firebase = require("nativescript-plugin-firebase");
import * as app_config from "~/app_config"

const localize = require("nativescript-localize");
firebase.init()

app.setResources({
    'numberConverter': numberConverter,
    'readableTimestamp': readableTimestamp,
    'expenseAmountToString': expenseAmountToString,
    'L': localize
});


app.start({moduleName: app_config.viewLogIn});