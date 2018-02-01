import {userPreferredCurrency} from "~/app_config";
import {currentTimeUTC} from "~/utils/time";
import * as underscore from "underscore"

export type ExpenseIdType = number;


export interface ExpenseConstructor {
    id: ExpenseIdType | null;

    amount: number;
    currency: string;
    name: string;
    tags: string[];

    timestamp_utc: string;
}

export interface IExpense extends ExpenseConstructor {
}

export function dummyExpense(id: number) {


    let e: IExpense = <ExpenseConstructor> {
        id: id,
        amount: underscore.sample(underscore.range(0, 100)),
        currency: 'EUR',
        name: `expense: #${id}`,
        timestamp_utc: currentTimeUTC(),
        tags: [],
    };

    return new Expense(e);
}

export class Expense implements IExpense {

    public id: ExpenseIdType;
    public amount: number;
    public currency: string;

    public name: string;
    public tags: string[];
    public timestamp_utc: string;

    // TODO `recurring` flag + date

    constructor(obj: ExpenseConstructor) {

        this.id = obj.id;
        this.amount = obj.amount;
        this.currency = obj.currency;

        this.name = obj.name
        this.tags = obj.tags
        this.timestamp_utc = obj.timestamp_utc
    }

    public static createEmptyExpense(): IExpense {
        return {
            id: null,
            amount: null,
            currency: userPreferredCurrency,
            name: null,
            tags: [],
            timestamp_utc: currentTimeUTC()

        }
    }
}