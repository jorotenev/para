import {getString, setString, flush} from "application-settings";
import {getCurrencies} from "~/utils/money";


interface _UserConfig {
    userPreferredCurrency: string
}

interface _AppConfig {
    viewAfterLogIn: string;
    viewLogIn: string;
    apiAddress: string;
    apiVersion: string;
    gitSha: string;
}

export class APP_CONFIG implements _AppConfig {
    gitSha: string;
    public viewAfterLogIn: string;
    public viewLogIn: string;
    public apiAddress: string;
    public apiVersion: string;

    private static instance: APP_CONFIG;

    private constructor() {
        let app_metadata = require("~/app_config.json");

        // this.apiAddress = "http://192.168.0.104:5000/";
        this.apiAddress = app_metadata.api_address;
        this.apiVersion = app_metadata.api_version;
        this.gitSha = app_metadata.git_sha;

        this.viewAfterLogIn = "expense/list/list";
        this.viewLogIn = "auth/login/login-view";
    }

    public static getInstance() {
        if (!APP_CONFIG.instance) {
            APP_CONFIG.instance = new APP_CONFIG()
        }
        return APP_CONFIG.instance
    }

}

export class USER_CONFIG implements _UserConfig {

    // userPreferredCurrency: string;
    private static instance: USER_CONFIG;
    private readonly user_uid;
    private _userPreferredCurrency: string;

    private constructor(user_uid) {
        let key = userAwareKey(userPreferredCurrencyKey, user_uid);
        this._userPreferredCurrency = getString(key, defaultCurrency);
        this.user_uid = user_uid
    }

    public static getInstance(sideEffect: UserConfigConstructor = null) {
        if (!USER_CONFIG.instance) {
            if (!sideEffect) {
                throw new Error("if no singleton exists, sideEffect is a mandatory argument")
            }
            USER_CONFIG.instance = new USER_CONFIG(sideEffect.user_id)
        }
        return this.instance
    }

    public static resetSingleton() {
        USER_CONFIG.instance = null;
    }

    public get userPreferredCurrency() {
        return this._userPreferredCurrency
    }

    public set userPreferredCurrency(currency: string) {
        validateCurrency(currency);
        let key = userAwareKey(userPreferredCurrencyKey, this.user_uid);
        setString(key, currency);
        this._userPreferredCurrency = currency;
        flush()
    }
}

const currencies = getCurrencies();

function validateCurrency(currency) {
    if (Object.keys(currencies).indexOf(currency) === -1) {
        throw new Error("Invalid default currency")
    }
}

export const userPreferredCurrencyKey = 'user_preferred_currency_code_key';
export const defaultCurrency = "EUR";

validateCurrency(defaultCurrency); // knowing me.
/**
 * Helps in simulating different per-user namespacaces in the persisted configuration
 * @param key
 * @param user
 * @return {string}
 */
function userAwareKey(key, user) {
    return key + "____" + user
}

export interface UserConfigConstructor {
    user_id: string
}
