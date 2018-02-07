import {Observable} from "tns-core-modules/data/observable";
import {ExpenseConstructor, IExpense} from '~/models/expense'
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {DataStore, IDataStore} from "~/expense_datastore/datastore";

let dialogs = require("ui/dialogs");
let http = require('http');
let u = require('underscore');


type ExpensesList = ObservableArray<IExpense>;

export class ListExpenseModel extends Observable {
    public expenses: ExpensesList;

    private loader: IExpensesListManager;
    private datastore: IDataStore;

    constructor() {
        super();
        this.datastore = DataStore.getInstance();
        this.expenses = this.datastore.expenses;

        this.loader = new ExpensesHandler(this.expenses, this.datastore); //TODO

    }


    public loadMoreItems(ev): Promise<void> {
        return this.loader.loadMoreItems(ev);
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
    addExpense(exp: ExpenseConstructor): boolean

}

abstract class ExpensesListManager implements IExpensesListManager {
    protected datastore: IDataStore;
    // How many items to fetch from the server in response to the loadMoreItems event
    batchSize: number = 10;


    constructor(expenses: ExpensesList, datastore: IDataStore) {
        this.datastore = datastore;
        this.initList()

    }

    abstract initList()

    abstract loadMoreItems(ev): Promise<void>

    public get expensesIds(): number[] {
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
            return Promise.reject("not initialized")
        }
        const startFromID = Math.max(...this.expensesIds) + 1;

        return this.fetchItems(startFromID)

    }

    private fetchItems(startFrom: number | null): Promise<void> {
        return this.datastore.get_list(startFrom, this.batchSize)
            .then(list => {
                list.forEach(exp => {
                    this.datastore.addExpense(exp);
                });
                return
            }, err => {
                throw err
            })
    }

    initList() {
        // TODO load initial batch
        this.fetchItems(null).then(() => {
            console.log("ListViewModel's datastore is initialised!")
        }, err => {
            console.error("Couldn't initialise the datastore of the ListViewModel");
            console.dir(err);
        })
    }


}




