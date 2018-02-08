import {userPreferredCurrency} from "~/app_config";
import {currentTimeUTC} from "~/utils/time";
import * as underscore from "underscore"
import {COMPARE_RESULT} from "~/utils/misc";

export type ExpenseIdType = number;


export interface ExpenseConstructor {
    id: ExpenseIdType | null;

    amount: number;
    currency: string;
    name: string;
    tags: string[];

    timestamp_utc: string;
    timestamp_utc_created: string;
    timestamp_utc_updated?: string;
}

export interface IExpense extends ExpenseConstructor {
    compare: (b: IExpense) => COMPARE_RESULT
}

export function dummyExpense(id: number) {


    let e: ExpenseConstructor = <ExpenseConstructor> {
        id: id,
        amount: underscore.sample(underscore.range(0, 100)),
        currency: 'EUR',
        name: `expense: #${id}`,
        timestamp_utc: currentTimeUTC(),
        timestamp_utc_created: currentTimeUTC(),
        tags: [],
    };

    return new Expense(e);
}

export class Expense implements IExpense {
    public compare(b: IExpense): COMPARE_RESULT {
        return Expense.comparator(this, b)// sort descendigly
    }

    public static comparator(a: IExpense, b: IExpense): COMPARE_RESULT {
        return a.id - b.id
    }

    public id: ExpenseIdType;
    public amount: number;
    public currency: string;

    public name: string;
    public tags: string[];

    // the timedata the user has entered himself
    public timestamp_utc: string;

    // when the expense was originally created
    public timestamp_utc_created: string;

    // when the expense was most recently edited
    public timestamp_utc_updated: string;

    // TODO `recurring` flag + date

    constructor(constructorObj: ExpenseConstructor) {

        this.id = constructorObj.id;
        this.amount = constructorObj.amount;
        this.currency = constructorObj.currency;

        this.name = constructorObj.name;
        this.tags = constructorObj.tags;
        this.timestamp_utc = constructorObj.timestamp_utc;
        this.timestamp_utc_updated = constructorObj.timestamp_utc_updated || constructorObj.timestamp_utc
        this.timestamp_utc_created = constructorObj.timestamp_utc_created || constructorObj.timestamp_utc
    }

    public static createEmptyExpense(): IExpense {
        return new Expense({
            id: null,
            amount: null,
            currency: userPreferredCurrency,
            name: null,
            tags: [],
            timestamp_utc: currentTimeUTC(),
            timestamp_utc_created: currentTimeUTC(),
            timestamp_utc_updated: currentTimeUTC(),
        })
    }
}
