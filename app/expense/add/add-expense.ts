import {AddExpenseModel} from "./add-expense-view-model";
import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
let u = require('underscore');
import {navigateTo} from "~/utils/nav"
let expenseModel = new AddExpenseModel();


export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
    let textField = page.getViewById("tags");

    if (textField) {
        textField.on("textChange", (ev) => {
            expenseModel.onTagsTextFieldChange(ev)
        });

    } else {
        console.error("can't find tags")
    }

    page.bindingContext = expenseModel;
}

export function submit() {
    expenseModel.createNewExpense()
    console.log("boomasd")
    navigateTo('expense/list/list')
}
