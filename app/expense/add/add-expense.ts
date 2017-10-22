import {AddExpenseModel} from "./add-expense-view-model";
import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
let u = require('underscore');
import {navigateTo} from "~/utils/nav"
let expenseModel = new AddExpenseModel();

let page: Page;
let textField;
let defaultTagLabel;
export function navigatingTo(args: EventData) {
    page = <Page> args.object;
    textField = page.getViewById("tags");
    defaultTagLabel = page.getViewById("empty-tags-filler");
    if (textField) {
        // http://underscorejs.org/#debounce
        textField.on("textChange", u.debounce(tagHandler, 100));

    } else {
        console.error("can't find tags");
    }

    page.bindingContext = expenseModel;
}
function tagHandler(ev) {
    expenseModel.onTagsTextFieldChange(ev);

}
export function submit() {
    expenseModel.createNewExpense();
    navigateTo('expense/list/list');
}

export function delete_tag(ev){
    console.log("del tag");
    // TODO using the bindingContext here seems bit hacky
    expenseModel.removeTag(ev.object.bindingContext)

}