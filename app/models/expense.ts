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


export class Expense implements IExpense {

    public id: ExpenseIdType;
    public amount: number;
    public currency: string;

    public name: string;
    public tags: string[];
    public timestamp_utc: string;

    // TODO `recurring` flag + date

    constructor(obj: ExpenseConstructor) {

        Object.keys(obj).forEach((key) => {
            this[key] = obj[key]
        })
    }
}