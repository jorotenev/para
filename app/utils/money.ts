import {ExpenseAmount} from "~/models/expense";
export function expenseAmountToString(amount: ExpenseAmount){
    return `${amount.raw_amount} ${amount.currency}`
}