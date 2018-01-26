import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {ExpenseFormMode, UpdateExpenseHelper} from "~/expense/common/common";
import {RadDataForm} from "nativescript-pro-ui/dataform";

let page: Page;
let dataform: RadDataForm;
let expense;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    expense = page.navigationContext.expense;
    dataform = <RadDataForm> page.getViewById('expense-form');

    page.bindingContext = new UpdateExpenseHelper({
        page: page,
        dataform: dataform,
        mode: ExpenseFormMode.update,
        expense: expense
    })

}





