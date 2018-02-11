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

export function setCurrency(currency: string): boolean {
    try {
        validateCurrency(currency)
        return true;
    } catch (err) {
        return false;
    }
}

export function setUserFirebaseUID(uid) {
    setString(userFirebaseUID, uid)
}

export function setFirebaseAuthToken(token) {
    setString(firebaseAuthTokenKey, token)
}

/*
 Config values
 */
// export const viewAfterLogIn = 'expense/add/add-expense';
export const viewAfterLogIn = 'expense/list/list';
export const viewLogIn = 'auth/login/login-view';
export const userPreferredCurrency = getString(userPreferredCurrencyKey, "EUR");
export const apiVersion = 'v1';
export const apiAddress = "http://192.168.0.104:5000/"; //TODO hack
export const userFirebaseUID = getString(userFirebaseUIDKey, null);
export const firebaseAuthToken = getString(firebaseAuthTokenKey, null);

