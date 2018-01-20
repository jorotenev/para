import * as _http from 'http';
import {Expense, ExpenseIdType, IExpense} from "~/models/expense";
import {apiAddress} from "~/app_config";
import {TextDecoration} from "tns-core-modules/ui/enums";
import * as u from 'underscore';
import {HttpResponse, HttpResponseEncoding} from "tns-core-modules/http";

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

export class Utils {
    static makeRequest(url, method = "GET", timeout = 1000): Promise<any> {

        return new Promise<any>(function (resolve, reject) {
            http.request({
                "url": url,
                "method": method,
                "timeout": timeout,
            }).then(
                function (response: HttpResponse) {

                    if (response.statusCode < 300) {
                        try {
                            let json = response.content.toJSON();
                            console.log("FULFILLED");
                            resolve(json);
                        } catch (err) {
                            reject("Can't decode received JSON")
                        }
                    } else {
                        const err = "Status code is " + response.statusCode + ` [${method}:${url}]`;
                        console.log("REJECTING: " + err);
                        reject(err);


                    }
                },
                function (err) {
                    console.log("MAJKATA SI E EBALO");
                    console.error(err);
                    reject(err)
                }
            )
        })
    }

}


export const EXPENSES_API_ENDPOINT = apiAddress + 'expenses_api/';

 export class ExpenseDatabaseFacade implements IExpenseDatabaseFacade {
    // http://underscorejs.org/#template
    static readonly GETListEndpointTemplate = u.template(`${EXPENSES_API_ENDPOINT}get_expenses_list?start_id=<%= startFromId %>&batch_size=<%= batchSize %>`);
    static readonly GETRangeEndpoint = u.template(`${EXPENSES_API_ENDPOINT}get_expenses_range/<%= fromID %>/<%= toID %>`);
    static readonly GETSingleEndpoint = u.template(`${EXPENSES_API_ENDPOINT}get_expense_by_id/<%= id %>`);

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
        let url = ExpenseDatabaseFacade.GETSingleEndpoint({id: id});
        return new Promise<IExpense>(function (resolve, reject) {
            Utils.makeRequest(url).then(resolve, function (err) {
                reject("Cannot find expense with id " + id + ". Reason: " + err);
            })
        });
    }


    get_list(startFromId: ExpenseIdType, batchSize: number): Promise<IExpense[]> {
        let url = ExpenseDatabaseFacade.GETListEndpointTemplate({
            startFromId: startFromId,
            batchSize: batchSize
        });

        return new Promise(function (resolve, reject) {
            Utils.makeRequest(url).then(function (json) {
                try {
                    resolve(json.map((raw) => new Expense(<IExpense> raw))) // TODO validate the response
                } catch (_) {
                    reject(new Error("Invalid response"))
                }
            }, function (err) {
                reject(new Error(`Can't get expenses: ${err.message} `))
            })
        })
    }
}