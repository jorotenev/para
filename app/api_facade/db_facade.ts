import {Expense, ExpenseConstructor, ExpenseIdType, IExpense} from "~/models/expense";
import {apiAddress, apiVersion} from "~/app_config";
import * as u from 'underscore';
import {RawResponseError, ResponseError, Utils} from "./common";


export const EXPENSES_API_ENDPOINT = `${apiAddress}expenses_api/${apiVersion}/`;

export enum HTTPMethod {
    POST = "POST",
    DELETE = "DELETE",
    GET = "GET",
    PUT = "PUT"
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

    remove(exp: IExpense): Promise<void>

    get_list(opts: GetListOpts): Promise<IExpense[]>

    sync(request: SyncRequest): Promise<SyncResponse>
}

export enum Order {
    asc = 'asc',
    desc = 'desc'
}

export interface GetListOpts {
    start_from: IExpense | null,
    batch_size?: number
    sort_order?: Order,
    sort_on?: keyof IExpense
}

export class ExpenseDatabaseFacade implements IExpenseDatabaseFacade {

    static readonly GETListEndpointTemplate =
        u.template(
            `${EXPENSES_API_ENDPOINT}get_expenses_list?<%= start_from_id %>&start_from_property=<%= start_from_property %>&start_from_property_value=<%=start_from_property_value%>&order_direction=<%= order_direction %>`
        );
    static readonly GETSingleEndpoint = u.template(`${EXPENSES_API_ENDPOINT}get_expense_by_id/<%= id %>`);
    static readonly POSTPersistEndpoint = `${EXPENSES_API_ENDPOINT}persist`;
    static readonly PUTUpdateEndpoint = `${EXPENSES_API_ENDPOINT}update`;
    static readonly DELETERemove = `${EXPENSES_API_ENDPOINT}remove`;
    static readonly GETSyncEndpoint = `${EXPENSES_API_ENDPOINT}sync`;

    persist(exp: IExpense): Promise<IExpense> {
        if (exp.id) {
            return Promise.reject({reason: "invalid state. can't persist an expense with an id."})
        }
        return this.send(exp, ExpenseDatabaseFacade.POSTPersistEndpoint, HTTPMethod.POST).then(persisted => {
            if (!persisted.id) {
                throw <ResponseError> {reason: "Invalid state. Server returned an expense with a null id after persisting"}
            }
            return persisted
        }, err => {
            throw err
        })
    }

    update(exp: IExpense): Promise<IExpense> {
        if (!exp.id) {
            return Promise.reject(<ResponseError>{reason: "Can't update an expense which doesn't have an ID"})
        }
        return this.send(exp, ExpenseDatabaseFacade.PUTUpdateEndpoint, HTTPMethod.PUT)
    }

    private send(exp: IExpense, url: string, method: HTTPMethod): Promise<IExpense> {
        return new Promise<IExpense>(function (resolve, reject) {
            Utils.makeRequest(url, method, exp).then(resolve, (err: RawResponseError) => reject({
                raw: err,
                reason: err.msg // TODO more informative message.
            }))
        });
    }

    remove(exp: IExpense): Promise<void> {
        if (!exp.id) {
            return Promise.reject(<ResponseError>{reason: "Can't delete an expense without an id"})
        }
        const id = exp.id;
        const url = ExpenseDatabaseFacade.DELETERemove;

        return Utils.makeRequest(url, HTTPMethod.DELETE, exp).catch(err => {
            throw {reason: err.msg, raw: err}
        });

    }

    get_list(opts: GetListOpts): Promise<IExpense[]> {
        // the app doesn't need to know what the server requries as a parameter, so here we extract
        // whatever the server expects

        let defaults = {
            start_from: null,
            batch_size: 10,
            sort_order: Order.desc,
            sort_on: 'timestamp_utc',
        };

        let options = {
            ...defaults,
            ...opts
        };

        let url = ExpenseDatabaseFacade.GETListEndpointTemplate({
            start_from_id: !!options.start_from ? options.start_from.id : null,
            start_from_property: options.sort_on,
            start_from_property_value: !!options.start_from ? options.start_from[options.sort_on] : null,

            order_direction: Order.desc,
            batch_size: options.batch_size,

        });
        return new Promise(function (resolve, reject: (reason?: ResponseError) => void) {
            Utils.makeRequest(url).then(function (json) {
                try {
                    let ready: IExpense[] = json.filter(Expense.validate_bool).map(e => new Expense(e));

                    if (ready.length !== json.length) {
                        console.error("some items in the response didn't validate")
                        //TODO log this to an exception tracker
                    }

                    resolve(ready)
                } catch (err) {
                    let error: ResponseError = {"reason": "Can't parse JSON"};
                    reject(error)
                }
            }, function (err) {
                let error: ResponseError = {
                    "reason": `Can't get expenses: ${err.msg} `,
                    "raw": err
                };
                reject(error)

            })
        })
    }

    sync(request: SyncRequest): Promise<SyncResponse> {
        let payload = request.map(e => u.pick(e, ['id', 'timestamp_utc', 'timestamp_updated_at']));

        let url = ExpenseDatabaseFacade.GETSyncEndpoint;
        return Utils.makeRequest(url, HTTPMethod.GET, payload)
            .then((response: SyncResponse) => {
                try {
                    validateSyncResponse(response)
                } catch (err) {
                    console.error("SyncResponse is invalid. " + err.message);
                    console.dir(response);
                    throw <ResponseError> {
                        reason: "Server didn't return a valid SyncResponse. " + err.message
                    }
                }
                return response
            }, err => {
                throw err
            })
    }

}

export interface SyncResponse {
    to_add: ExpenseConstructor[]
    to_update: ExpenseConstructor[]
    to_remove: ExpenseIdType[]
}

export type SyncRequest = ExpenseConstructor[]


function validateSyncResponse(response: any) { // todo make it more robust

    const expectedObjectKeys = ['to_update', 'to_add', 'to_remove'];
    const getID = {
        'to_update': (val) => val.id,
        'to_add': (val) => val.id,
        'to_remove': (val) => val
    }
    let hasAllProperties = expectedObjectKeys.every((key) => response.hasOwnProperty(key));

    if (!hasAllProperties) {
        throw new Error("response contains only " + Object.keys(response) + " as keys")
    }
    let allAreArrays = expectedObjectKeys.every((key) => u.isArray(response[key]));

    if (!allAreArrays) {
        throw new Error("the values of all keys must be arrays")
    }

    let ids = {};
    const err = new Error("id appears in more than one section of the response");

    expectedObjectKeys.forEach(key => {
        response[key].forEach(exp => {
            let id = getID[key](exp)
            if (ids.hasOwnProperty(id)) {
                throw err
            }
            ids[id] = null
        })
    })

}