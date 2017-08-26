import {Observable} from "data/observable";
let moment = require('moment');
export interface IExpense {
    id: number;

    amount: number;
    name: string;
    timestamp_utc: string;
    tags: string[];

    readable_timestamp: string;
}


export class Expense extends Observable implements IExpense {
    id: number;

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

    get readable_timestamp(): string {
        return moment.utc(this.timestamp_utc).calendar()
    };



}