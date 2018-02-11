import {ExpenseConstructor} from "~/models/expense";

export let ten_expenses: ExpenseConstructor[] = require("~/para-common/sample_expenses.json");

export const SINGLE_EXPENSE: ExpenseConstructor = Object.freeze(ten_expenses[0]);
