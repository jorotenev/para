import {EventData} from "tns-core-modules/data/observable";
import {ItemEventData} from "tns-core-modules/ui/list-view";
import {Page} from "tns-core-modules/ui/page";
import {ListExpenseModel} from "./list-view-model";
import {navigateTo} from "~/utils/nav"
import {IExpense} from "~/models/expense";
import {RadListView} from "nativescript-ui-listview";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import {hideKeyboard} from "~/utils/ui";
import {localize as l} from "nativescript-localize";
import * as dialogs from "ui/dialogs";
import {authObservable} from "~/auth/auth_event"
import {DataStore} from "~/expense_datastore/datastore";

let listModel: ListExpenseModel = new ListExpenseModel();
let page: Page;
let listView: RadListView;
let indicator: ActivityIndicator;

/*
when the user logs out, clean up the data store
not touching the ListExpenseModel because  re-initialising it might
lead to API requests which are pointless - we don't have a user
*/
authObservable.addEventListener(authObservable.logoutEvent, DataStore.resetDataStore);
/*
 relevant when a user has logged in, then logs out
 and a different user logs in. We call this particular method
 because we care about the *order* of re-initialising.
 First we want to empty the datastore and only then
 re-initialise the list-view-model.
 */
authObservable.addEventListener(authObservable.loginEvent, startFresh);


export function navigatingTo(args: EventData) {
    hideKeyboard();
    page = <Page>args.object;
    indicator = page.getViewById('act-ind-list-page');
    listView = <RadListView> page.getViewById('expenses-list');

    page.bindingContext = listModel;
}

export function loadMoreItems(ev: EventData): void {
    // https://github.com/NativeScript/NativeScript/issues/4931
    const fireEventAfter = 100; //ms
    setTimeout(() => {
        listModel.loadMoreItems(ev).then(() => {
            listView.notifyLoadOnDemandFinished()
        }, (err) => {
            console.dir(err);
            dialogs.alert(err.reason);
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
            title: l('refresh_failed'),
            message: err,
            okButtonText: "Ok"
        });
    });
}

export function tryToReconnectToAPI() {

    listModel.showIndicator = true;

    listModel.initList().then(_ => {
        listModel.connectivity_issues = false;
        listModel.showIndicator = false;

        console.log("refreshing list view");
        listView.refresh();
    }, err => {
        listModel.showIndicator = false;
        console.log("refreshing list view");

        listView.refresh();
    })
}

function startFresh() {
    console.log("START FRESH");
    DataStore.resetDataStore();
    listModel = new ListExpenseModel();
}