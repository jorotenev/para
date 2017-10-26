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


let userPreferredCurrencyKey = 'user_preferred_currency_code';



/*
 Config values
 */
export const viewAfterLogIn = 'expense/add/add-expense';
// export const viewAfterLogIn='expense/list/list';
export const viewLogIn = 'auth/login-view';
export const userPreferredCurrency = getString(userPreferredCurrencyKey, "EUR");
