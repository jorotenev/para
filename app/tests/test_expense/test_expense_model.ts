import {Expense} from "~/models/expense";
import {ten_expenses} from "~/tests/test_api_facade/sample_responses";
import {COMPARE_RESULT} from "~/utils/misc";

fdescribe("Testing the Expense class", function () {

    it("sorting via the static comparator works as expected", function () {
        let first_expense = ten_expenses[0];
        let second_expense = ten_expenses[1];
        let third_expense = ten_expenses[2];
        let expenses = [
            new Expense(third_expense),
            new Expense(second_expense),
            new Expense(first_expense),
        ];

        expenses.sort(Expense.comparator);
        let ids = expenses.map((e) => e.id);
        expect(ids).toEqual([first_expense.id, second_expense.id, third_expense.id])

    });
    it("compare via the instance method", function () {
        let first_expense = new Expense(ten_expenses[0]);
        let second_expense = new Expense(ten_expenses[1]);
        expect(first_expense.compare(second_expense)).toBe(COMPARE_RESULT.SMALLER);
        expect(second_expense.compare(first_expense)).toBe(COMPARE_RESULT.LARGER);

        expect(first_expense.compare(first_expense)).toBe(COMPARE_RESULT.EQUAL);
        expect(second_expense.compare(second_expense)).toBe(COMPARE_RESULT.EQUAL)
    });
});