import {Observable} from "data/observable";
let moment = require('moment');

export class ExpenseConstructor {
    amount: number;
    name: string;
    tags: string[];
    timestamp_utc: string;
}

export interface IExpense extends ExpenseConstructor {
    id: number;
}


export class Expense extends Observable implements IExpense {
    id: number;

    amount: number;
    name: string;
    tags: string[];
    timestamp_utc: string;
    // TODO `recurring` flag + date


    constructor(obj: ExpenseConstructor) {
        super();
        this.id = null;

        this.amount = obj.amount;
        this.name = obj.name;
        this.timestamp_utc = obj.timestamp_utc;
        this.tags = obj.tags;
    }


}