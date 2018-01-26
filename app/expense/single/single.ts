import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {Expense, ExpenseConstructor, IExpense} from "~/models/expense";
import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import * as dialogs from "ui/dialogs";
import {toggleActivityIndicator} from "~/utils/ui";
import {ExpenseFormMode, group_1, group_2, group_3, UpdateExpenseHelper} from "~/expense/common";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {hashCode} from "~/utils/misc";

let moment = require("moment");
let page: Page;
let dataform: RadDataForm;
let expense;

let activityIndicator: ActivityIndicator;
let initialObjectHash: number;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    activityIndicator = <ActivityIndicator> page.getViewById('busy-ind');
    expense = page.navigationContext.expense;
    dataform = <RadDataForm> page.getViewById('expense-form');


    page.bindingContext = new UpdateExpenseHelper({
        page: page,
        dataform: dataform,
        mode: ExpenseFormMode.update,
        expense: expense
    })

}





