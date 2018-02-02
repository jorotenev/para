import {firebase, http} from "~/api_facade/db_facade";
import {HttpResponse} from "tns-core-modules/http";
import {apiAddress, apiVersion} from "~/app_config";

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
    static readonly tokenHeader = "x-firebase-auth-token";

    static makeRequest(url: string, method = "GET", payload: any = null, timeout = 3000): Promise<any> {
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
                            headers: [{[Utils.tokenHeader]: token}],
                            content: jsonPayload,
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
                                msg: errMsg,
                                statusCode: response.statusCode
                            };
                            reject(error);
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

