import {Observable} from "data/observable";
let moment = require('moment');

export type ExpenseIdType = number;

export interface ExpenseAmount {
    raw_amount: number;
    currency: string;
}

export interface ExpenseConstructor {

}

export interface IExpense {
    id: ExpenseIdType | null;
    amount: ExpenseAmount;
    name: string;
    tags: string[];
    timestamp_utc: string;
}


export class Expense extends Observable implements IExpense {

    public id: ExpenseIdType;
    public amount: ExpenseAmount;
    public name: string;
    public tags: string[];
    public timestamp_utc: string;

    // TODO `recurring` flag + date

    constructor(obj: IExpense) {
        super();
        this.id = obj.id;

        this.amount = obj.amount;
        this.name = obj.name;
        this.timestamp_utc = obj.timestamp_utc;
        this.tags = obj.tags;
    }

}