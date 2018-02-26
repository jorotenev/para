import {Observable} from "tns-core-modules/data/observable";
import {ExpenseIdType, IExpense} from '~/models/expense'
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {DataStore, IDataStore} from "~/expense_datastore/datastore";
import {GetListOpts} from "~/api_facade/db_facade";
import {ObservableProperty} from "~/utils/misc";

let dialogs = require("ui/dialogs");
let http = require('http');
let u = require('underscore');


type ExpensesList = ObservableArray<IExpense>;

export class ListExpenseModel extends Observable {
    public expenses: ExpensesList;

    @ObservableProperty()
    public connectivity_issues: boolean = false;
    private loader: IExpensesListManager;
    private datastore: IDataStore;

    constructor() {
        super();
        this.datastore = DataStore.getInstance();
        this.expenses = this.datastore.expenses;

        this.loader = new ExpensesHandler(this.expenses, this.datastore); //TODO
        let that = this;
        this.loader.initList().then(() => {
        }, err => {
            console.log("connectivity_issues = true")
            that.connectivity_issues = true
        })

    }

    public loadMoreItems(ev): Promise<void> {
        return this.loader.loadMoreItems(ev);
    }

    public initItems(): Promise<IExpense[]> {
        return this.loader.initList()
    }

    public isEmpty(): boolean {
        return this.expenses.length === 0;
    }
}

export interface IExpensesListManager {

    expenses: ExpensesList;

    // loads the initial batch of items
    initList();

    // called when the user has reached the end of the loaded items
    loadMoreItems(ev): Promise<void>;

    // add an expense to the list
    addExpense(exp: IExpense): boolean

}

abstract class ExpensesListManager implements IExpensesListManager {
    protected datastore: IDataStore;
    // How many items to fetch from the server in response to the loadMoreItems event
    batchSize: number = 10;


    constructor(expenses: ExpensesList, datastore: IDataStore) {
        this.datastore = datastore;

    }

    abstract initList()

    abstract loadMoreItems(ev): Promise<void>

    public get expensesIds(): ExpenseIdType[] {
        return this.expenses.map((exp: IExpense) => exp.id)
    }

    public get expenses() {
        return this.datastore.expenses
    }

    public isEmpty(): boolean {
        return this.expenses.length === 0
    }

    public addExpense(expense: IExpense): boolean {
        if (this.expensesIds.indexOf(expense.id) !== -1) {
            console.log(`Expense with id ${expense.id} already is in the expenses list`);
            return false;
        }
        this.expenses.push(expense);
        return true;
    }

    ensureExpensesIsNotEmpty() {
        if (this.expenses.length === 0) {
            throw new Error("Calling loadMoreItems when there are no items")
        }
    }

}

class ExpensesHandler extends ExpensesListManager {


    public loadMoreItems(ev: any): Promise<void> {
        // TODO call the server to fetch
        if (this.isEmpty()) {
            console.log("Trying to loadmoreitems before there're any expenses")
            return Promise.reject("not initialized")
        }
        // const startFromID = Math.min(...this.expensesIds) - 1;
        let last = this.datastore.expenses.getItem(this.datastore.expenses.length - 1)
        return this.fetchItems(last).then(() => {
                console.log("loadMoreItems promise returned")
                return
            }
        )
    }

    private fetchItems(startFrom: IExpense | null): Promise<IExpense[]> {
        let request_opts: GetListOpts = {
            batch_size: this.batchSize,
            start_from: startFrom,
        };

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




