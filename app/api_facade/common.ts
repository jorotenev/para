import {HttpResponse} from "tns-core-modules/http";
import * as _http from 'http';
import * as _firebase from "nativescript-plugin-firebase";
import {HTTPMethod} from "~/api_facade/db_facade";

// easier mocking
export let firebase = _firebase;
export let http = _http;

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

interface RequestOpts {
    url: string,
    method?: HTTPMethod,
    payload?:any,
    timeout?: number
}


export class Utils {
    static readonly default_timeout = 3000
    static readonly tokenHeader = "x-firebase-auth-token";
    static makeRequestOpts(opts:RequestOpts){
        return Utils.makeRequest(opts.url, opts.method, opts.payload, opts.timeout)
    }
    static makeRequest(url: string, method: HTTPMethod = HTTPMethod.GET, payload: any = null, timeout : number = Utils.default_timeout): Promise<any> {
        let jsonPayload = null;
        try {
            jsonPayload = this.validateAndStringifyPayload(payload)
        } catch (err) {
            return Promise.reject({msg: err.message})
        }

        return new Promise<any>(function (resolve, reject) {
            firebase.getAuthToken({})
                .then((token) => {
                    return http.request({
                            url: url,
                            method: method,
                            timeout: timeout,
                            headers: {[Utils.tokenHeader]: token},
                            content: jsonPayload,
                        }
                    )
                }, (() => {
                    throw new Error("can't get auth token")
                }))
                .then(
                    function (response: HttpResponse) {
                        let json = null;
                        try {
                            json = response.content.toJSON();
                        } catch (err) {
                            reject({msg: "Can't decode received JSON", statusCode: response.statusCode});
                            return
                        }

                        if (response.statusCode < 300) { // todo check how redirects are handled
                            resolve(json);
                            return
                        } else {
                            const genericMsg = "Status code is " + response.statusCode + ` [${method}:${url}]`;
                            let errorMsg = Utils.extractErrorMsg(json) || genericMsg;
                            let error: RawResponseError = {
                                msg: errorMsg,
                                statusCode: response.statusCode
                            };
                            reject(error);
                            return
                        }
                    })
                .catch((err) => {
                    if (err instanceof Error) {
                        err = err.message;
                    }

                    console.error(err);
                    let error: RawResponseError = {msg: err};
                    reject(error)
                })
        })
    }

    private static extractErrorMsg(payload): string | null {
        return (payload && payload.error) ? payload.error : null
    }

    private static validateAndStringifyPayload(payload: object): string {
        if (payload === null) {
            return null
        }
        try {
            let stringified = JSON.stringify(payload);
            if (typeof stringified !== 'string') {
                throw new Error("Result of stringify is " + typeof stringified)
            }
            return stringified
        } catch (err) {
            throw new Error("Invalid JSON passed. " + err.message)
        }
    }
}

