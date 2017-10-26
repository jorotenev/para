import {Observable, PropertyChangeData} from "tns-core-modules/data/observable";
import {IExpense, Expense} from '~/models/expense'
import {currentTimeUTC, readableTimestamp} from '~/utils/time'
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {ExpenseConstructor} from "~/models/expense";
import {tuple} from "~/types";
let dialogs = require("ui/dialogs");
let http = require('http');
let u = require('underscore');


type ExpensesList = ObservableArray<IExpense>;

export class ListExpenseModel extends Observable {
    public expenses: ExpensesList;
    private loader: IExpensesListManager;

    constructor() {
        super();
        this.expenses = new ObservableArray([]);

        this.loader = new DummyExpensesList(this.expenses); //TODO
    }


    public loadMoreItems(ev) {
        this.loader.loadMoreItems(ev);
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
    loadMoreItems(ev): void;

    // add an expense to the list
    addExpense(exp: ExpenseConstructor): boolean

}

abstract class ExpensesListManager implements IExpensesListManager {

    _expenses: ExpensesList;
    // How many items to fetch from the server in response to the loadMoreItems event
    numItemsToFetch: number = 10;


    constructor(expenses: ExpensesList) {
        this._expenses = expenses;
        this.initList()
    }

    abstract initList()

    abstract loadMoreItems(ev): void

    public get expensesIds(): number[] {
        return this.expenses.map((exp: IExpense) => exp.id)
    }

    public get expenses() {
        return this._expenses
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


    public loadMoreItems(ev: any): void {
        // TODO call the server to fetch
        this.ensureExpensesIsNotEmpty();

        const currentMaxId = Math.max(...this.expensesIds);
        const IdsRangeToFetch: tuple = [currentMaxId + 1, currentMaxId + 1 + this.numItemsToFetch];
    }

    private fetchExpenses(range: tuple) {
        const url = "INVALID URL";
        http.getJSON(url).then(
            (json) => {
                console.log(json);
            }, (err) => {
                console.error(err)
            })
    }

    initList() {
        // TODO load initial batch
        console.log('initialising the list')
    }


}

class DummyExpensesList extends ExpensesListManager {

    public initList() {
        this.dummyExpenses()
    }

    public loadMoreItems(ev: any) {
        this.ensureExpensesIsNotEmpty();

        console.log('loading more items');

        let oldestID = Math.max(...this.expensesIds);

        if (oldestID !== this.expenses.getItem(this.expenses.length - 1).id) {
            console.error("Last item doesn't have the highest id.")
        }
        // add ten more items
        for (let i of u.range(oldestID + 1, oldestID + this.numItemsToFetch)) {
            this.dummyAdd(i)
        }
    }

    public dummyExpenses(): void {
        for (let i of u.range(1, 2)) {
            this.dummyAdd(i);
        }
    }

    /**
     * fake GETing an item from the server; add it to the observable array.
     * @param id
     */
    private dummyAdd(id: number) {

        if (id > 55) {
            // the "server" doesn't have more than 55 items
            return;
        }
        let e: IExpense = <IExpense> {
            id: null,
            amount: {'raw_amount':u.sample(u.range(0,100)), 'currency':'EUR'}, // pick a random number from 0 to 100
            name: `id: ${id}`,
            timestamp_utc: currentTimeUTC(),
            tags: [],
        };

        let exp = new Expense(e);
        exp.id = id; // HACK id is not part of the constructor

        let isExpensesAdded = this.addExpense(exp);
    }


}


