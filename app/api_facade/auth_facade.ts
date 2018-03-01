import {Utils} from "./common";
import {APP_CONFIG} from "~/app_config";
import {HTTPMethod} from "~/api_facade/db_facade";

let apiAddr = APP_CONFIG.getInstance().apiAddress
let apiVer = APP_CONFIG.getInstance().apiVersion
export const AUTH_API_ENDPOINT = `${apiAddr}auth_api/${apiVer}/`;

interface IAuthFacade {
    register(): void
}

export class AuthFacade implements IAuthFacade {
    static readonly POSTRegisterEndpoint = `${AUTH_API_ENDPOINT}register`;

    register(): Promise<void> {
        return Utils.makeRequest(AuthFacade.POSTRegisterEndpoint, HTTPMethod.POST)
    }

}