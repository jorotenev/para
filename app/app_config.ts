import {
    getBoolean,
    setBoolean,
    getNumber,
    setNumber,
    getString,
    setString,
    hasKey,
    remove,
    clear
} from "application-settings";
import {getCurrencies} from "~/utils/money";


const currencies = getCurrencies()

function validateCurrency(currency) {
    if (Object.keys(currencies).indexOf(currency) === -1) {
        throw new Error("Invalid default currency")
    }
}

export const userPreferredCurrencyKey = 'user_preferred_currency_code_key';
export const firebaseAuthTokenKey = 'usr_firebase_authtoken_key';
const userFirebaseUIDKey = 'usr_uid_key';
export const defaultCurrency = "EUR";

validateCurrency(defaultCurrency)

export function setCurrency(currency: string) {
    validateCurrency(currency)
    setString(userPreferredCurrencyKey, currency)
    userPreferredCurrency = currency
}


/*
 Config values
 */
// export const viewAfterLogIn = 'expense/add/add-expense';
export const viewAfterLogIn = 'expense/list/list';
export const viewLogIn = 'auth/login/login-view';
export let userPreferredCurrency = getString(userPreferredCurrencyKey, "EUR");
export const apiVersion = 'v1';
export const fallback_api_endpoint = null; // todo
// export const apiAddress = "http://192.168.0.104:5000/"; //TODO hack https://7k0z5nk6fc.execute-api.eu-central-1.amazonaws.com/staging/
export const apiAddress = "https://7k0z5nk6fc.execute-api.eu-central-1.amazonaws.com/staging/"; //TODO hack https://7k0z5nk6fc.execute-api.eu-central-1.amazonaws.com/staging/

console.log(`userPreferredCurrency=${userPreferredCurrency}
apiVersion=${apiVersion}
apiAddress=${apiAddress}
`)