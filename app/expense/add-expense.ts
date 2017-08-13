import {AddExpenseModel} from "./add-expense-view-model";
import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {ValueConverter} from "tns-core-modules/ui/core/bindable";
let u = require('underscore');

let expenseModel = new AddExpenseModel();


export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
    page.bindingContext = expenseModel;
}

export function submit() {
    expenseModel.createNewExpense()
}