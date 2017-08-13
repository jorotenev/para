import {IExpense} from "../models/expense";

export interface IExpensePersistor {
    persistNew(expense: IExpense): void;
    update(expense: IExpense): void;
}

class Persistor implements IExpensePersistor {
    persistNew(expense: IExpense): void {
        console.log("Persisting expense");
        console.dir(expense);
        try {
            // write to db
        } catch (err) {
            // panic at the disco
        }

    }

    /**
     * Given an expense(with an id),
     * update the persisted expense with the id
     * to match this new one.
     * @param expense
     */
    update(expense: IExpense): void {
        throw new Error("not implemented")
    }
}

let persistor = null;
export function getPersistor() {
    if (persistor === null) {
        persistor = new Persistor();
    }
    return persistor;
}