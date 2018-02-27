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
import {
    ExpenseDatabaseFacade as _ExpenseDatabaseFacade,
    IExpenseDatabaseFacade,
    SyncRequest,
    SyncResponse
} from "~/api_facade/db_facade";
import {ResponseError} from "~/api_facade/common";
import {ObservableArray} from "tns-core-modules/data/observable-array";
import "~/utils/add/ObservableArrayfindIndex";
import {COMPARE_RESULT} from "~/utils/misc"; // imported for its side effects
//easier mocking
export let ExpenseDatabaseFacade = _ExpenseDatabaseFacade;

export interface IDataStore extends IExpenseDatabaseFacade {
    expenses: ObservableArray<IExpense>

    _addExpense(exp: IExpense)

    _removeExpense(expId: ExpenseIdType)
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
            this._addExpense(persisted);
            // todo ensure no expense with this id exists in this.expenses

            return persisted
        }, (err) => {
            throw err
        });
    }

    update(exp: IExpense, old_exp: IExpense): Promise<IExpense> {
        if (!this.expenseIsManaged(exp)) {
            return Promise.reject(<ResponseError>{reason: "Can't update an expense which is not in the datastore"})
        }

        return this.proxyTarget.update(exp, old_exp).then((updated) => {
            // update the object of this datastore with the value resolved from the api
            let indexOfUpdated = this.indexOfExpense(updated);
            if (indexOfUpdated !== -1) {
                this.expenses.setItem(indexOfUpdated, updated);
                if (exp.timestamp_utc !== old_exp.timestamp_utc) {
                    this._sort()
                }
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
                this._removeExpense(exp.id);
                this.expenses.splice(index, 1); // delete the element at the given index
                return Promise.resolve()
            }, err => {
                throw err
            })
    }


    get_list(request_opts): Promise<IExpense[]> {
        return this.proxyTarget.get_list.apply(this.proxyTarget, arguments);
    }

    sync(request: SyncRequest): Promise<SyncResponse> {
        return this.proxyTarget.sync(request).then((response: SyncResponse) => {
            // remove
            response.to_remove.forEach((id: ExpenseIdType) => {
                try {
                    this._removeExpense(id)
                } catch (err) {
                    console.error(err.message)
                }
            });

            //update
            response.to_update.forEach((expense: IExpense) => {
                let index = this.indexOfExpense(expense)
                if (index !== -1) {
                    this.expenses.setItem(index, expense)
                }
            })

            //add
            response.to_add.forEach((expense: IExpense) => {
                try {
                    this._addExpense(expense)

                } catch (err) {
                    console.dir(err)
                }
            })
            return response
        }, err => {
            throw err
        })
    }

    public _addExpense(exp: IExpense) {
        if (this.expenseIsManaged(exp)) {
            throw <ResponseError> {'reason': "Invalid application state. Expenses with the same id = " + exp.id}
        }
        this.expenses.push(exp);

        this._sort()

    }

    public _removeExpense(arg: ExpenseIdType) {

        let index = this.expenses.findIndex((e) => e.id === arg);
        if (index === -1) {
            throw new Error("no managed expense with such id")
        }

        this.expenses.splice(index, 1);
    }

    private expenseIsManaged(exp: IExpense): boolean {
        return this.indexOfExpense(exp) !== -1
    }

    private indexOfExpense(exp: IExpense): number {
        return this.expenses.findIndex(managed_exp => managed_exp.id === exp.id)
    }

    private _sort() {
        this.expenses.sort((a, b) => {
            return -1 * Expense.comparator(a, b) // reverse the natural ordering
        })
    }
}