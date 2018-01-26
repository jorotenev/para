import * as _http from 'http';
import {Expense, ExpenseIdType, IExpense} from "~/models/expense";
import {apiAddress} from "~/app_config";
import {TextDecoration} from "tns-core-modules/ui/enums";
import * as u from 'underscore';
import {HttpResponse, HttpResponseEncoding} from "tns-core-modules/http";
import underline = TextDecoration.underline;

export let http = _http;

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

    get_list(startFromId: ExpenseIdType, batchSize: number): Promise<IExpense[]>

}


export const EXPENSES_API_ENDPOINT = apiAddress + 'expenses_api/';

export class ExpenseDatabaseFacade implements IExpenseDatabaseFacade {

    static readonly GETListEndpointTemplate = u.template(`${EXPENSES_API_ENDPOINT}get_expenses_list?start_id=<%= startFromId %>&batch_size=<%= batchSize %>`);
    static readonly GETRangeEndpoint = u.template(`${EXPENSES_API_ENDPOINT}get_expenses_range/<%= fromID %>/<%= toID %>`);
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


    get_list(startFromId: ExpenseIdType, batchSize: number): Promise<IExpense[]> {
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
    msg: string
    statusCode?: number
}

/**
 * used by the facade to format the error in a more user readable format
 */
export interface ResponseError {
    readonly reason: string
    readonly raw?: RawResponseError

}

export class Utils {
    static makeRequest(url: string, method = "GET", payload = null, timeout = 3000): Promise<any> {

        return new Promise<any>(function (resolve, reject) {
            http.request({
                url: url,
                method: method,
                timeout: timeout,
                content: payload,
            }).then(
                function (response: HttpResponse) {
                    if (response.statusCode < 300) {
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
                },
                function (err) {
                    console.error(err);
                    let error: RawResponseError = {"msg": err};
                    reject(error)
                }
            )
        })
    }

}
