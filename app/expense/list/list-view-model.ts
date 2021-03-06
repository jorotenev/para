import {Observable} from "tns-core-modules/data/observable";
import {IExpense} from '~/models/expense'
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {DataStore, IDataStore} from "~/expense_datastore/datastore";
import {ObservableProperty} from "~/utils/misc";
import {GetListOpts} from "~/api_facade/types";
import {APP_CONFIG} from "~/app_config";
import {authObservable} from "~/auth/auth_event";

type ExpensesList = ObservableArray<IExpense>;

export class ListExpenseModel extends Observable {

    public expenses: ExpensesList;

    @ObservableProperty()
    public connectivity_issues: boolean = false;

    @ObservableProperty()
    public showIndicator: boolean = false;

    @ObservableProperty()
    public hasItems: boolean;

    protected datastore: IDataStore;

    // How many items to fetch from the server in response to the loadMoreItems event
    batchSize: number = 10;

    // simple flag to keep whether the user has fetched all available expenses
    // from the api. when true, no further API requests will be made
    // in response to RadListView's loadMoreData event
    private loadedAllAvailableExpenses: boolean = false;

    constructor() {
        super();
        this.datastore = DataStore.getInstance();
        this.expenses = this.datastore.expenses;
        this.hasItems = this.datastore.expenses.length > 0;
        this.datastore.expenses.on(ObservableArray.changeEvent, this.updateExpensesSize.bind(this));

        let that = this;
        that.showIndicator = true;

        this.initList().then(() => {
            that.showIndicator = false

        }, err => {
            console.log("connectivity_issues = true");
            that.connectivity_issues = true;
            that.showIndicator = false
        })

    }

    private updateExpensesSize() {
        // HACK https://github.com/NativeScript/NativeScript/issues/5476
        this.hasItems = this.expenses.length > 0
    }

    public pullToRefresh() {
        if (this.datastore.expenses.length > APP_CONFIG.getInstance().maximumSyncRequestSize) {
            // if we pull to refresh, the oldest expenses might get trimmed.
            // thus we set the flag to false, so that after the pull-to-refresh
            // if we scroll down, we will make an API request
            this.loadedAllAvailableExpenses = false
        }

        return this.datastore.sync(this.datastore.simpleExpensesArray())
    }

    public isEmpty(): boolean {
        return this.expenses.length === 0
    }

    public loadMoreItems(ev: any): Promise<void> {
        // no needed to query the API because a previous loadMoreItems call returned all available expenses
        if (this.loadedAllAvailableExpenses) {
            console.log("skipping loadMoreItems() - previous call delpleted the server");
            return Promise.resolve();
        }

        let last: IExpense = this.isEmpty() ? null : this.datastore.expenses.getItem(this.datastore.expenses.length - 1);
        let batchSize = this.batchSize;
        return this.fetchItems(last).then((fetched_expenses) => {
                if (fetched_expenses.length < batchSize) {
                    this.loadedAllAvailableExpenses = true;
                }
            }, (err) => {
                throw err
            }
        )
    }

    private fetchItems(startFrom: IExpense | null): Promise<IExpense[]> {
        let request_opts: GetListOpts = {
            batch_size: this.batchSize,
            start_from: startFrom,
        };
        let that = this;
        return this.datastore.get_list(request_opts)
            .then(list => {
                list.forEach(exp => {
                    this.datastore._addExpense(exp);
                });
                console.log(`successfully added ${list.length} expenses `);
                return list
            }, err => {
                throw err
            })
    }

    initList(): Promise<IExpense[]> {
        // load initial batch
        if (this.datastore.expenses.length !== 0) {
            console.log("DataStore already has items. Skipping..")
            return Promise.resolve(this.datastore.simpleExpensesArray())
        }
        return this.fetchItems(null).then((expenses) => {
            console.log(`ListViewModel's datastore is initialised with ${expenses.length} items!`);
            console.log("expenses size is " + this.expenses.length);
            return expenses
        }, err => {
            console.error("Couldn't initialise the datastore of the ListViewModel");
            console.dir(err);
            throw err
        })

    }
}





