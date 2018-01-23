import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {SingleExpenseModel} from "./single-view-model";
import {Expense, ExpenseConstructor, IExpense} from "~/models/expense";
import {DataFormEventData, RadDataForm} from "nativescript-pro-ui/dataform";

let moment = require("moment");
let page: Page;
let dataform;
let expense;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    expense = page.navigationContext.expense;
    expense = prepareExpenseObject(expense);

    dataform = page.getViewById('expenseEditForm');
    page.bindingContext = new SingleExpenseModel(expense)
}

function prepareExpenseObject(expense: IExpense) {
    let copy: any = {...expense};
    copy.date = moment(copy.timestamp_utc).format("YYYY-MM-D");
    copy.time = moment(copy.timestamp_utc).format("HH:mm");
    delete copy.timestamp
    return copy;
}

export function onValidate(d: DataFormEventData) {
    d.returnValue = true;
}

export function onValidated(d: DataFormEventData) {
    d.returnValue = true;
}

export function onCommit(d: DataFormEventData) {
    d.returnValue = true
}

export function onCommitted(d: DataFormEventData) {
    console.log(`onCommitted ${d.propertyName}=${d.entityProperty} `);
    console.dir(JSON.parse(dataform.editedObject));
    console.dir(expense)
}