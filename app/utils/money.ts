import {IExpense} from "~/models/expense";

export function expenseAmountToString(expense: IExpense) {
    return `${expense.amount} ${expense.currency}`
}