import * as app from 'application';
import {readableTimestamp} from "~/utils/time";
import {expenseAmountToString} from "~/utils/money";
import {numberConverter} from "~/utils/number";
import {APP_CONFIG} from "~/app_config"
import {device} from "platform"
import * as moment from "moment"
import firebase = require("nativescript-plugin-firebase");

const localize = require("nativescript-localize");

firebase.init();
if (device.language === 'bg') {
    moment.locale('bg')
} else {
    moment.locale("en-gb")  // so that week starts on Monday. default is en-us.
}

app.setResources({
    'numberConverter': numberConverter,
    'readableTimestamp': readableTimestamp,
    'expenseAmountToString': expenseAmountToString,
    'L': localize
});


app.start({moduleName: APP_CONFIG.getInstance().viewLogIn});