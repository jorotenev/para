import {getString, setString} from "application-settings";
import {getCurrencies} from "~/utils/money";


const currencies = getCurrencies();

function validateCurrency(currency) {
    if (Object.keys(currencies).indexOf(currency) === -1) {
        throw new Error("Invalid default currency")
    }
}

export const userPreferredCurrencyKey = 'user_preferred_currency_code_key';
export const defaultCurrency = "EUR";

validateCurrency(defaultCurrency); // knowing me.

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
        // this.apiAddress = "http://192.168.0.104:5000/"; //https://7k0z5nk6fc.execute-api.eu-central-1.amazonaws.com/staging/
        this.apiAddress = "https://7k0z5nk6fc.execute-api.eu-central-1.amazonaws.com/staging/"; //https://7k0z5nk6fc.execute-api.eu-central-1.amazonaws.com/staging/
        this.apiVersion = "v1";
        this.viewAfterLogIn = "expense/list/list";
        this.viewLogIn = "auth/login/login-view";
        let app_metadata = require("~/metadata.json");
        this.gitSha = app_metadata.git_sha;
    }

    public static getInstance() {
        if (!APP_CONFIG.instance) {
            APP_CONFIG.instance = new APP_CONFIG()
        }
        return APP_CONFIG.instance
    }

}

function userAwareKey(key, user) {
    return key + "____" + user
}

export interface UserConfigConstructor {
    user_id: string
}

export class USER_CONFIG implements _UserConfig {

    // userPreferredCurrency: string;
    private static instance: USER_CONFIG;
    private readonly user_uid;
    private _userPreferredCurrency: string;

    private constructor(user_uid) {
        this._userPreferredCurrency = getString(userAwareKey(userPreferredCurrencyKey, user_uid), defaultCurrency)

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
        setString(userAwareKey(userPreferredCurrencyKey, this.user_uid), currency)
        this._userPreferredCurrency = currency
    }
}