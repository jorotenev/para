import {EventData} from "tns-core-modules/data/observable";
import {ItemEventData} from "tns-core-modules/ui/list-view";
import {Page} from "tns-core-modules/ui/page";
import {ListExpenseModel} from "./list-view-model";
import {navigateTo} from "~/utils/nav"
import {IExpense} from "../../models/expense";
import {topmost} from "ui/frame";
import {RadListView} from "nativescript-pro-ui/listview";

let listModel = new ListExpenseModel();
let page: Page;
let listView: RadListView;

export function navigatingTo(args: EventData) {

    page = <Page>args.object;
    listView = <RadListView> page.getViewById('expenses-list');
    page.bindingContext = listModel

}

export function loadMoreItems(ev: EventData): void {
    // https://github.com/NativeScript/NativeScript/issues/4931
    const fireEventAfter = 100; //ms
    setTimeout(() => {
        listModel.loadMoreItems(ev).then(() => {
            listView.notifyLoadOnDemandFinished()
        }, (err) => {
            console.dir(err)
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
    /**
     * TODO
     * on refresh:
     *  - gather the ids of the expenses in the current list and when they were updated //todo
     *  - send them to the api
     *    - the api will return to arrays - 1) objects that have been updated (have newer `timestamp_utc_updated`)
     *      2) objects that have newer IDs than the newest in the list
     * */
    console.log("onPullToRefreshInitiated");
    setTimeout(() => {
        console.log('listView.notifyPullToRefreshFinished finished');
        listView.notifyPullToRefreshFinished()
    }, 1000)
}
