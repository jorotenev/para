import {EventData} from "tns-core-modules/data/observable";
import {ItemEventData, ListView} from "tns-core-modules/ui/list-view";
import {Page} from "tns-core-modules/ui/page";
import {ListExpenseModel} from "./list-view-model";
import {navigateTo} from "~/utils/nav"
import {IExpense} from "../../models/expense";

let listModel = new ListExpenseModel();
let page: Page;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    page.bindingContext = listModel;
}


export function loadMoreItems(ev: EventData): void {
    // https://github.com/NativeScript/NativeScript/issues/4931
    console.log("loadMoreItems");
    const fireEventAfter = 200; //ms
    setTimeout(() => {
        listModel.loadMoreItems(ev);
    }, fireEventAfter);
}


export function onTap(ev: ItemEventData): void {
    let itemIndex: number = ev.index;
    let expense: IExpense = listModel.expenses.getItem(itemIndex);
    console.log(`onTap: {'id': ${expense.id}, 'amount': ${expense.amount}}`)
}
