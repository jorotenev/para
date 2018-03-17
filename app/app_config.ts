import {getString, setString, flush, getBoolean, setBoolean} from "application-settings";
import {getCurrencies} from "~/utils/money";


interface _UserConfig {
    userPreferredCurrency: string

    /*
     * used to govern how are datetimes shown.
     * true -> 11/11/2017 13:11
     * false -> "Yesterday at 13:11"
     */
    userPrefersShortDateFormat: boolean
}

interface _AppConfig {

    // which page to show when the user has to login
    viewLogIn: string;

    // and when he logs in successfully
    viewAfterLogIn: string;

    // the address of the backend, with a mandatory trailing slash
    apiAddress: string;

    apiVersion: string;

    // the git sha of the most recently updated git sha (update happens on app prepare
    // the result is written to app_config.json
    gitSha: string;

    // https://github.com/jorotenev/para_api/issues/1
    maximumSyncRequestSize: number;
}

export class APP_CONFIG implements _AppConfig {
    public readonly gitSha: string;
    public readonly viewAfterLogIn: string;
    public readonly viewLogIn: string;
    public readonly apiAddress: string;
    public readonly apiVersion: string;
    public readonly maximumSyncRequestSize;
    private static instance: APP_CONFIG;

    private constructor() {
        let app_metadata = require("~/app_config.json");

        // this.apiAddress = "http://192.168.0.104:5000/";
        this.apiAddress = app_metadata.api_address;
        this.apiVersion = app_metadata.api_version;
        this.gitSha = app_metadata.git_sha;

        this.viewAfterLogIn = "expense/list/list";
        this.viewLogIn = "auth/login/login-view";

        this.maximumSyncRequestSize = 15;
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

    private _userPrefersShortDateString: boolean;

    private constructor(user_uid) {
        let currencyKey = userAwareKey(userPreferredCurrencyKey, user_uid);
        let dateFormatKey = userAwareKey(userPreferredDateFormatKey, user_uid);

        this._userPreferredCurrency = getString(currencyKey, defaultCurrency);
        this._userPrefersShortDateString = getBoolean(dateFormatKey, true);

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

    public get userPrefersShortDateFormat() {
        return this._userPrefersShortDateString
    }

    public set userPreferredCurrency(currency: string) {
        validateCurrency(currency);
        let key = userAwareKey(userPreferredCurrencyKey, this.user_uid);
        setString(key, currency);
        this._userPreferredCurrency = currency;
        flush()
    }

    public set userPrefersShortDateFormat(prefers: boolean) {
        let key = userAwareKey(userPreferredDateFormatKey, this.user_uid);
        setBoolean(key, prefers);
        this._userPrefersShortDateString = prefers;
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
export const userPreferredDateFormatKey = 'user_preferred_data_format_key';
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
