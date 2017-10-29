import * as _http from 'http';
import {Expense, ExpenseIdType, IExpense} from "~/models/expense";
import {apiAddress} from "~/app_config";
import {TextDecoration} from "tns-core-modules/ui/enums";
import * as u from 'underscore';
export let http = _http;

export interface IExpenseDatabaseFacade {
    /**
     *
     * @param exp - the expense to persist
     * @param callback - function which will be called when the
     */
    persist(exp: IExpense): Promise<IExpense>

    update(exp: IExpense): Promise<IExpense>

    remove(exp: IExpense): Promise<boolean>

    get_single(id: ExpenseIdType): Promise<IExpense>

    get_list(startFromId: ExpenseIdType, batchSize: number): Promise<IExpense[]>

}

export class ExpenseDatabaseFacade implements IExpenseDatabaseFacade {
    // http://underscorejs.org/#template
    static readonly GETListEndpointTemplate =  u.template(`${apiAddress}get_expenses_list/<%= startFromId %>?batch_size=<%= batchSize %>`);
    static readonly GETRangeEndpoint = u.template(`${apiAddress}get_expenses_range/<%= fromID %>/<%= toID %>`);
    static readonly GETSingleEndpoint = `${apiAddress}get_expense_by_id/<%= id %>`;


    constructor() {

    }

    persist(exp: IExpense): Promise<IExpense> {
        return undefined;
    }

    update(exp: IExpense): Promise<IExpense> {
        return undefined;
    }

    remove(exp: IExpense): Promise<boolean> {
        return undefined;
    }

    get_single(id: ExpenseIdType): Promise<IExpense> {
        return undefined;

    }

    get_list(startFromId: ExpenseIdType, batchSize: number): Promise<IExpense[]> {
        let url = ExpenseDatabaseFacade.GETListEndpointTemplate({
            startFromId: startFromId,
            batchSize: batchSize
        });
        return new Promise(function (resolve, reject) {
            http.getJSON(url).then((response: object[]) => {
                    try {
                        resolve(response.map((raw) => new Expense(<IExpense> raw)))
                    } catch (_) {
                        reject(new Error("Invalid response"))
                    }
                },
                (err) => {
                    console.log("PRINTING ERROR");
                    console.log(err);
                    reject(new Error(err))
                })
        })
    }


}