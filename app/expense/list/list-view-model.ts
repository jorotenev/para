import {Observable, PropertyChangeData} from "tns-core-modules/data/observable";
import {IExpense,Expense} from '~/models/expense'
import {currentTime} from '~/utils/time'
import {ObservableArray} from "tns-core-modules/data/observable-array";

let dialogs = require("ui/dialogs");
let u = require('underscore');

export class ListExpenseModel extends Observable {
    public expenses: ObservableArray<IExpense>;

    constructor() {
        super();
        this.expenses = new ObservableArray([]);
        this.dummyExpenses()

    }

    private dummyExpenses(): void {
        for (let i of u.range(1, 2)) {
            this.addToObservableArray(i)
        }
    }

    /**
     * fake GETing an item from the server; add it to the observable array.
     * @param id
     */
    private addToObservableArray(id: number) {

        if (id > 55) {
            // the "server" doesn't have more than 55 items
            return;
        }

        // sanity checking
        let allIds: number[] = this.expenses.map(el => el.id);
        if (allIds.indexOf(id) !== -1) {
            console.error(`Trying to add id:${id} again`);
            return;
        }

        let exp = new Expense(<IExpense> {
            amount: u.sample(u.range(100)), // pick a random number from 0 to 100
            name: `id: ${id}`,
            id: id,
            timestamp_utc: currentTime(),
        });


        this.expenses.push(u.clone(exp))

    }

    public loadMoreItems(ev) {
        console.log('loading more items');


        let oldestID = Math.max(...this.expenses.map(el => el.id));

        if (oldestID !== this.expenses.getItem(this.expenses.length - 1).id) {
            console.error("Last item doesn't have the highest id.")
        }
        // add ten more items
        for (let i of u.range(oldestID + 1, oldestID + 10)) {
            this.addToObservableArray(i)
        }
    }


    public isEmpty(): boolean {
        return this.expenses.length === 0;
    }
}