/**
 * Proxy of the API facade.
 * Instance of the DataStore holds a mirror of a subset of the expenses on the backend.
 * CRUD operations pass through the datastore en route to the API facade(IExpenseDatabaseFacade).
 * This way there's a centralised, stateful, repository of expenses locally on the phone.
 * add/updating/deleting an expense via the UI will alter the state of the datastore.
 *
 * When a call is made to the datastore, the call will firs be forwarded to the API facade.
 * Only then the result will be used to alter (if needed) the state of the DataStore.
 */
import {Expense, ExpenseIdType, IExpense} from "~/models/expense";
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

    static _instance: DataStore;

    private constructor() {
        this.expenses = new ObservableArray([]);
        this.proxyTarget = new ExpenseDatabaseFacade()
    }

    // DataStore is a singleton
    public static getInstance(): DataStore {
        if (!DataStore._instance) {
            DataStore._instance = new DataStore()
        }
        return DataStore._instance
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
        this.expenses.push(exp)

        // TODO ensure expenses are sorted
        if (this.expenses.length > 1 && this.expenses.getItem(0).compare(this.expenses.getItem(1)) < 0) {  //todo assumes numerical ids
            console.error("fucked up, duct-taping"); //todo send this to an online log repository
            this.expenses.sort(Expense.comparator) // todo assumes numerical ids
        }

    }

    private expenseIsManaged(exp: IExpense): boolean {
        return this.indexOfExpense(exp) !== -1
    }

    private indexOfExpense(exp: IExpense): number {
        return this.expenses.findIndex(managed_exp => managed_exp.id === exp.id)
    }
}