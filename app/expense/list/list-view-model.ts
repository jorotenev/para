import {Observable} from "tns-core-modules/data/observable";
import {IExpense} from '~/models/expense'
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {DataStore, IDataStore} from "~/expense_datastore/datastore";
import {GetListOpts, SyncRequest} from "~/api_facade/db_facade";
import {ObservableProperty} from "~/utils/misc";

const dialogs = require("ui/dialogs");

type ExpensesList = ObservableArray<IExpense>;

export class ListExpenseModel extends Observable {
    public expenses: ExpensesList;

    @ObservableProperty()
    public connectivity_issues: boolean = false;

    @ObservableProperty()
    public hasItems: boolean;

    protected datastore: IDataStore;
    // How many items to fetch from the server in response to the loadMoreItems event
    batchSize: number = 10;

    constructor() {
        super();

        this.datastore = DataStore.getInstance();
        this.expenses = this.datastore.expenses;
        this.hasItems = this.datastore.expenses.length > 0;
        this.datastore.expenses.on(ObservableArray.changeEvent, this.updateExpensesSize.bind(this));

        let that = this;
        this.initList().then(() => {
        }, err => {
            console.log("connectivity_issues = true");
            that.connectivity_issues = true
        })
    }

    private updateExpensesSize() {
        console.log("updateExpensesSize")
        this.hasItems = this.expenses.length > 0
    }

    public pullToRefresh() {
        return this.datastore.sync(this.datastore.simpleExpensesArray())
    }

    public isEmpty(): boolean {
        return this.expenses.length === 0
    }

    public loadMoreItems(ev: any): Promise<void> {
        if (this.isEmpty()) {
            console.log("Trying to loadmoreitems before there're any expenses")
            return Promise.reject("not initialized")
        }
        // const startFromID = Math.min(...this.expensesIds) - 1;
        let last: IExpense = this.datastore.expenses.getItem(this.datastore.expenses.length - 1)
        return this.fetchItems(last).then(() => {
                console.log("loadMoreItems promise returned");
                return
            }, (err) => {
                dialogs.alert(err.reason)
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





