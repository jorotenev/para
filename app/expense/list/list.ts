import {EventData} from "tns-core-modules/data/observable";
import {ItemEventData} from "tns-core-modules/ui/list-view";
import {Page} from "tns-core-modules/ui/page";
import {ListExpenseModel} from "./list-view-model";
import {navigateTo} from "~/utils/nav"
import {IExpense} from "~/models/expense";
import {topmost} from "ui/frame";
import {RadListView} from "nativescript-ui-listview";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";

var dialogs = require("ui/dialogs");

let listModel: ListExpenseModel;
let page: Page;
let listView: RadListView;
let flag = true;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    listView = <RadListView> page.getViewById('expenses-list');
    page.bindingContext = listModel = new ListExpenseModel();
}

export function loadMoreItems(ev: EventData): void {
    // https://github.com/NativeScript/NativeScript/issues/4931
    const fireEventAfter = 100; //ms
    setTimeout(() => {
        listModel.loadMoreItems(ev).then(() => {
            listView.notifyLoadOnDemandFinished()
        }, (err) => {
            console.dir(err);
            listView.notifyLoadOnDemandFinished();
        });
    }, fireEventAfter);
}


export function onTap(ev: ItemEventData): void {
    let itemIndex: number = ev.index;
    let expense: IExpense = listModel.expenses.getItem(itemIndex);
    console.log(`onTap: {'id': ${expense.id}, 'amount': ${expense.amount}, 'timestamp': ${expense.timestamp_utc}`);
    navigateTo({path: 'expense/single/single', backstackVisible: true, extraContext: {'expense': expense}})

}


export function goToAddExpense() {
    navigateTo({path: 'expense/add/add-expense', backstackVisible: false})
}

export function onPullToRefreshInitiated() {
    listModel.pullToRefresh().then((succ) => {
        listView.notifyPullToRefreshFinished()
    }, (err) => {
        listView.notifyPullToRefreshFinished();

        dialogs.alert({
            title: "Refresh failed",
            message: err,
            okButtonText: "Ok"
        });
    });
}


export function tryToReconnectToAPI() {
    let indicator: ActivityIndicator = page.getViewById('con-issue-act-ind')

    indicator.busy = true;
    indicator.visibility = 'visible';

    listModel.initList().then(_ => {
        listModel.connectivity_issues = false;
        console.log("refreshing list view");
        listView.refresh();
    }, err => {
        indicator.busy = false;
        indicator.visibility = 'collapse';
        console.log("refreshing list view");

        listView.refresh();
    })
}