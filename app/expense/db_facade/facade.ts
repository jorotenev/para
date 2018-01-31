import * as _http from 'http';
import {Expense, ExpenseIdType, IExpense} from "~/models/expense";
import {apiAddress, apiVersion} from "~/app_config";
import * as u from 'underscore';
import {HttpResponse} from "tns-core-modules/http";
import * as _firebase from "nativescript-plugin-firebase"
// easier mocking
export let firebase = _firebase;
export let http = _http;

export enum SortByOptions {
    date_descending
}

export interface IExpenseDatabaseFacade {
    /**
     * add a new expense
     * @param {IExpense} exp
     * @returns {Promise<IExpense>} the returned expense has the id parameter set.
     */
    persist(exp: IExpense): Promise<IExpense>

    /**
     * use the id of an expense; sync the version on the backend with `exp`
     * @param {IExpense} exp
     * @returns {Promise<IExpense>}
     */
    update(exp: IExpense): Promise<IExpense>

    remove(exp: IExpense): Promise<boolean>

    get_single(id: ExpenseIdType): Promise<IExpense>

    get_list(startFromId: ExpenseIdType, batchSize: number, sortBy: SortByOptions): Promise<IExpense[]>

}


export const EXPENSES_API_ENDPOINT = `${apiAddress}expenses_api/${apiVersion}/`;

export class ExpenseDatabaseFacade implements IExpenseDatabaseFacade {

    static readonly GETListEndpointTemplate = u.template(`${EXPENSES_API_ENDPOINT}get_expenses_list?start_id=<%= startFromId %>&batch_size=<%= batchSize %>`);
    static readonly GETSingleEndpoint = u.template(`${EXPENSES_API_ENDPOINT}get_expense_by_id/<%= id %>`);
    static readonly POSTPersistEndpoint = `${EXPENSES_API_ENDPOINT}persist`;
    static readonly PUTUpdateEndpoint = `${EXPENSES_API_ENDPOINT}update`;


    persist(exp: IExpense): Promise<IExpense> {
        if (exp.id) {
            return Promise.reject({reason: "invalid state. can't persist an expense with an id."})
        }
        return this.send(exp, ExpenseDatabaseFacade.POSTPersistEndpoint, "POST")
    }

    update(exp: IExpense): Promise<IExpense> {
        return this.send(exp, ExpenseDatabaseFacade.PUTUpdateEndpoint, 'PUT')
    }

    private send(exp, url, method): Promise<IExpense> {
        return new Promise<IExpense>(function (resolve, reject) {
            let json = JSON.stringify(exp);
            Utils.makeRequest(url, method, json).then(resolve, (err: RawResponseError) => reject({
                raw: err,
                reason: err.msg // TODO more informative message.
            }))
        });
    }

    remove(exp: IExpense): Promise<boolean> {
        return undefined;
    }


    get_single(id: ExpenseIdType): Promise<IExpense> {
        let url = ExpenseDatabaseFacade.GETSingleEndpoint({id: id});
        return new Promise<IExpense>(function (resolve, reject: (reason?: ResponseError) => void) {
            Utils.makeRequest(url).then(resolve, function (err) {
                reject({"reason": "Cannot find expense with id " + id + ". Reason: " + err, "raw": err});
            })
        });
    }


    get_list(startFromId: ExpenseIdType, batchSize: number, sortBy: SortByOptions = SortByOptions.date_descending): Promise<IExpense[]> {
        let url = ExpenseDatabaseFacade.GETListEndpointTemplate({
            startFromId: startFromId,
            batchSize: batchSize
        });

        return new Promise(function (resolve, reject: (reason?: ResponseError) => void) {
            Utils.makeRequest(url).then(function (json) {
                try {
                    resolve(json.map((raw) => new Expense(<IExpense> raw))) // TODO validate the response
                } catch (err) {
                    let error: ResponseError = {"reason": "Can't parse JSON"};
                    reject(error)
                }
            }, function (err) {
                let error: ResponseError = {
                    "reason": `Can't get expenses: ${err.message} `,
                    "raw": err
                };
                reject(error)

            })
        })
    }


}

/**
 * returned by the makeRequest. contains information as returned by the server
 */
export interface RawResponseError {
    readonly msg: string
    readonly statusCode?: number
}

/**
 * used by the facade to format the error in a more user readable format
 */
export interface ResponseError {
    readonly reason: string
    readonly raw?: RawResponseError
}

export class Utils {
    static readonly tokenHeader = "x-firebase-auth-token"

    static makeRequest(url: string, method = "GET", payload = null, timeout = 3000): Promise<any> {
        console.log(`[${method}::${url}] payload=${JSON.stringify(payload)}`);

        return new Promise<any>(function (resolve, reject) {
            firebase.getAuthToken({})
                .then((token) => {
                    return http.request({
                            url: url,
                            method: method,
                            timeout: timeout,
                            headers: [{[Utils.tokenHeader]: token}],
                            content: payload,
                        }
                    )
                }, (() => {
                    throw new Error("can't get auth token")
                }))
                .then(
                    function (response: HttpResponse) {
                        if (response.statusCode < 300) { // todo check how redirects are handled
                            try {
                                let json = response.content.toJSON();
                                resolve(json);
                            } catch (err) {
                                reject("Can't decode received JSON")
                            }
                        } else {
                            //TODO get the error msg the server returned
                            const errMsg = "Status code is " + response.statusCode + ` [${method}:${url}]`;
                            let error: RawResponseError = {
                                "msg": errMsg,
                                "statusCode": response.statusCode
                            };
                            reject(error);
                        }
                    })
                .catch((err) => {
                    if (err instanceof Error) {
                        err = err.message;
                    }

                    console.error(err);
                    let error: RawResponseError = {"msg": err};
                    reject(error)
                })
        })
    }

}
