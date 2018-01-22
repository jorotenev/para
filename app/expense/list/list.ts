import {EventData} from "tns-core-modules/data/observable";
import {ItemEventData, ListView} from "tns-core-modules/ui/list-view";
import {Page} from "tns-core-modules/ui/page";
import {ListExpenseModel} from "./list-view-model";
import {navigateTo} from "~/utils/nav"
import {IExpense} from "../../models/expense";
import {topmost} from "ui/frame";

let listModel = new ListExpenseModel();
let page: Page;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    page.bindingContext = {
        filter_by: ['Amount', "Date"],
        stuffs: listModel
    };
}

export function loadMoreItems(ev: EventData): void {
    // https://github.com/NativeScript/NativeScript/issues/4931
    const fireEventAfter = 200; //ms
    setTimeout(() => {
        listModel.loadMoreItems(ev);
    }, fireEventAfter);
}


export function onTap(ev: ItemEventData): void {
    let itemIndex: number = ev.index;
    let expense: IExpense = listModel.expenses.getItem(itemIndex);
    console.log(`onTap: {'id': ${expense.id}, 'amount': ${expense.amount}, 'timestamp': ${expense.timestamp_utc}`)
    console.log("navigated");

    topmost().navigate({
        'moduleName': 'expense/single/single',
        'context': {'expense': expense}
    })
}
