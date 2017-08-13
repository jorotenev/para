import {Observable} from "data/observable";

export interface IExpense {
    id: string;

    amount: number;
    name: string;
    timestamp_utc: string;
}


export class Expense extends Observable implements IExpense {
    id: string;

    amount: number;
    name: string;
    timestamp_utc: string;


    constructor(amount: number, name: string, timestamp: string, id: string) {
        super();
        this.amount = amount;
        this.name = name;
        this.timestamp_utc = timestamp;

        this.id = id;
    }


}