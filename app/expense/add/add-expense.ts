import {AddExpenseModel} from "./add-expense-view-model";
import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
let u = require('underscore');
import {navigateTo} from "~/utils/nav"
import {Button} from "tns-core-modules/ui/button";
import {TextField} from "tns-core-modules/ui/text-field";

let expenseModel = new AddExpenseModel();
let page: Page;
let add_tag_textfield: TextField;
export function navigatingTo(args: EventData) {
    page = <Page> args.object;
    add_tag_textfield = <TextField> page.getViewById('add-tag-text');
    page.bindingContext = expenseModel;
}


export function submit() {
    expenseModel.createNewExpense();
    navigateTo('expense/list/list');
}

export function add_tag(ev) {
    let tag_name: string = add_tag_textfield.text;
    tag_name= tag_name.trim();
    let tag_added = expenseModel.tagsHandler.add(tag_name);
    if (tag_added) {
        add_tag_textfield.text = '';
        setTimeout(() => {
            add_tag_textfield.focus();
        }, 0)
    } else {
        // todo inform user why adding the tag failed.
    }
}

export function delete_tag(ev) {
    // todo magic - getting the tag_name from the binding context doesn't feel right
    let tag_name = ev.object.bindingContext;
    expenseModel.tagsHandler.delete(tag_name)
}