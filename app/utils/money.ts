import {IExpense} from "~/models/expense";
import {currencies} from "./currencies"

export function expenseAmountToString(expense: IExpense) {
    return `${expense.amount} ${expense.currency}`
}

/**
 * returns an object with a 3three letter abbr. as a key and value the canonical name
 * of the currency; all in english
 * https://openexchangerates.org/api/currencies.json
 */
export function getCurrencies() {
    return currencies
}