import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {SingleExpenseModel} from "./single-view-model";
import {IExpense} from "~/models/expense";

let singleModel = new SingleExpenseModel();
let page: Page;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    let expense: IExpense = page.navigationContext.expense;

    page.bindingContext = {
        'expense': expense
    };
}