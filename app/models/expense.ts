import {userPreferredCurrency} from "~/app_config";
import {currentTimeUTC} from "~/utils/time";
import * as underscore from "underscore"
import {COMPARE_RESULT} from "~/utils/misc";
import {expense_schema} from "~/models/expense_json_schema";
import * as tv4 from "tv4"

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
        return Expense.comparator(this, b)
    }

    public static validate_bool(exp): boolean {
        try {
            Expense.validate_throw(exp)
            return true
        }
        catch {
            return false
        }
    }

    public static validate_throw(exp): void {
        let validationResult = tv4.validateResult(exp, expense_schema)
        if (!validationResult.valid) {
            let err = validationResult.error
            let msg = err.dataPath + ": " + err.message
            throw msg
        }
    }

    public static comparator(a: IExpense, b: IExpense): COMPARE_RESULT {
        if (a.timestamp_utc > b.timestamp_utc) {
            return COMPARE_RESULT.LARGER
        } else if (b.timestamp_utc > a.timestamp_utc) {
            return COMPARE_RESULT.SMALLER
        } else {
            return COMPARE_RESULT.EQUAL
        }
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
