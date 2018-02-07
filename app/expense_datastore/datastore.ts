import {ExpenseIdType, IExpense} from "~/models/expense";
import {ExpenseDatabaseFacade as _ExpenseDatabaseFacade, IExpenseDatabaseFacade} from "~/api_facade/db_facade";
import {ResponseError} from "~/api_facade/common";
import {ObservableArray} from "tns-core-modules/data/observable-array";
import "~/utils/add/ObservableArrayfindIndex"; // imported for its side effects
//easier mocking
export let ExpenseDatabaseFacade = _ExpenseDatabaseFacade;

export interface IDataStore extends IExpenseDatabaseFacade {
    expenses: ObservableArray<IExpense>

    addExpense(exp: IExpense)
}

export class DataStore implements IDataStore {
    public readonly expenses: ObservableArray<IExpense>;
    private readonly proxyTarget: IExpenseDatabaseFacade;

    constructor() {
        this.expenses = new ObservableArray([]);
        this.proxyTarget = new ExpenseDatabaseFacade()
    }


    persist(exp: IExpense): Promise<IExpense> {
        return this.proxyTarget.persist(exp).then((persisted) => {
            this.addExpense(persisted);
            // todo ensure no expense with this id exists in this.expenses

            return persisted
        }, (err) => {
            throw err
        });
    }

    update(exp: IExpense): Promise<IExpense> {
        if (!this.expenseIsManaged(exp)) {
            return Promise.reject(<ResponseError>{reason: "Can't update an expense which is not in the datastore"})
        }

        return this.proxyTarget.update(exp).then((updated) => {
            // update the object of this datastore with the value resolved from the api
            let indexOfUpdated = this.indexOfExpense(updated);
            if (indexOfUpdated !== -1) {
                this.expenses[indexOfUpdated] = updated
            } else {
                throw <ResponseError> {
                    reason: "Invalid application state. When updating, the expense returned by the API," +
                    "doesn't exist in the local DataStore"
                }
            }

            return updated
        }, err => {
            throw err
        })
    }

    remove(exp: IExpense): Promise<void> {
        if (!this.expenseIsManaged(exp)) {
            return Promise.reject(<ResponseError>{reason: "No such expense in the DataStore"})
        }
        let index = this.indexOfExpense(exp);
        return this.proxyTarget.remove(exp)
            .then(_ => {
                this.expenses.splice(index, 1); // delete the element at the given index
                return Promise.resolve()
            }, err => {
                throw err
            })
    }

    get_single(id: ExpenseIdType): Promise<IExpense> {
        return this.proxyTarget.get_single.apply(this.proxyTarget, arguments);
    }

    get_list(startFromId: ExpenseIdType, batchSize: number): Promise<IExpense[]> {
        return this.proxyTarget.get_list.apply(this.proxyTarget, arguments);
    }

    public addExpense(exp: IExpense) {
        if (this.expenseIsManaged(exp)) {
            throw <ResponseError> {'reason': "Invalid application state. Expenses with the same id = " + exp.id}
        }
        this.expenses.unshift(exp)

    }

    private expenseIsManaged(exp: IExpense): boolean {
        return this.indexOfExpense(exp) !== -1
    }

    private indexOfExpense(exp: IExpense): number {
        return this.expenses.findIndex(managed_exp => managed_exp.id === exp.id)
    }
}