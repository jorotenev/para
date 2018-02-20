import {IExpense} from "~/models/expense";

export let ten_expenses: IExpense[] = require("~/para-common/sample_expenses.json");

export const SINGLE_EXPENSE: IExpense = Object.freeze(ten_expenses[0]);
