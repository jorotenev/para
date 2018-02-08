import {Utils} from "./common";
import {apiAddress, apiVersion} from "~/app_config";
import {HTTPMethod} from "~/api_facade/db_facade";

export const AUTH_API_ENDPOINT = `${apiAddress}auth_api/${apiVersion}/`;

interface IAuthFacade {
    register(): void
}

export class AuthFacade implements IAuthFacade {
    static readonly POSTRegisterEndpoint = `${AUTH_API_ENDPOINT}register`;

    register(): Promise<void> {
        return Utils.makeRequest(AuthFacade.POSTRegisterEndpoint, HTTPMethod.POST)
    }

}