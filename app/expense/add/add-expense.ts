import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";

let u = require('underscore');
import {navigateTo} from "~/utils/nav"
import {TextField} from "tns-core-modules/ui/text-field";
import {ResponseError} from "~/expense/db_facade/facade";
import {ExpenseFormMode, getViewModel} from "~/expense/common/common";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {Expense, IExpense} from "~/models/expense";

let dialogs = require("ui/dialogs");

let page: Page;

export function navigatingTo(args: EventData) {
    page = <Page> args.object;

    page = <Page>args.object;
    let expense: IExpense = Expense.createEmptyExpense();
    let dataform = <RadDataForm> page.getViewById('expense-form');

    page.bindingContext = getViewModel({
        page: page,
        dataform: dataform,
        mode: ExpenseFormMode.new,
        expense: expense,
        onSuccessfulOperation: (newExpense: IExpense) => {
            console.log("created a new expense with id " + newExpense.id)
            // navigateTo('expense/list/list');
        }
    });
}


// export function submit() {
//     expenseModel.createNewExpense().then(function (expense) {
//         console.log("persisted successfully");
//     }, function (err: ResponseError) {
//         console.dir(err);
//         dialogs.alert({
//             title: 'Couldn\'t save the expense',
//             message: err.reason,
//             okButtonText: 'Cool'
//         })
//     });
// }
//
