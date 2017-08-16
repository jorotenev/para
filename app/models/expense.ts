import {Observable} from "data/observable";

export interface IExpense {
    id: string;

    amount: number;
    name: string;
    timestamp_utc: string;
    tags: string[];

}


export class Expense extends Observable implements IExpense {
    id: string;

    amount: number;
    name: string;
    tags: string[];
    timestamp_utc: string;


    constructor(obj: IExpense) {
        super();
        this.id = obj.id;

        this.amount = obj.amount;
        this.name = obj.name;
        this.timestamp_utc = obj.timestamp_utc;
        this.tags = obj.tags;
    }


}