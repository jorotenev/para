import {EventData} from "tns-core-modules/data/observable";
import {ItemEventData, ListView} from "tns-core-modules/ui/list-view";
import {Page} from "tns-core-modules/ui/page";
import {ListExpenseModel} from "./list-view-model";
import {navigateTo} from "~/utils/nav"
import {IExpense} from "../../models/expense";
import {topmost} from "ui/frame";
import {DataStore} from "~/expense_datastore/datastore";
import {RadListView} from "nativescript-pro-ui/listview";

let listModel = new ListExpenseModel();
let page: Page;
let listView: RadListView;

export function navigatingTo(args: EventData) {
    let store = DataStore.getInstance();
    console.log("SIZE OF STORE IS " + store.size_available())
    page = <Page>args.object;
    listView = <RadListView> page.getViewById('expenses-list');
    page.bindingContext = listModel

}

export function loadMoreItems(ev: EventData): void {
    // https://github.com/NativeScript/NativeScript/issues/4931
    const fireEventAfter = 200; //ms
    setTimeout(() => {
        listModel.loadMoreItems(ev).then(()=>{
            console.log("Finished");
            listView.notifyLoadOnDemandFinished()
        }, (err) => {
            console.log("error" + err);
            listView.notifyLoadOnDemandFinished();
        });
    }, fireEventAfter);
}


export function onTap(ev: ItemEventData): void {
    let itemIndex: number = ev.index;
    let expense: IExpense = listModel.expenses.getItem(itemIndex);
    console.log(`onTap: {'id': ${expense.id}, 'amount': ${expense.amount}, 'timestamp': ${expense.timestamp_utc}`);

    topmost().navigate({
        'moduleName': 'expense/single/single',
        'context': {'expense': expense}
    })
}


export function goToAddExpense() {
    navigateTo('expense/add/add-expense')
}

export function onPullToRefreshInitiated() {
    console.log("onPullToRefreshInitiated")
}