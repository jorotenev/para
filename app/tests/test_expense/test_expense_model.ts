import {Expense} from "~/models/expense";
import {SINGLE_EXPENSE, ten_expenses} from "~/tests/test_api_facade/sample_responses";
import {COMPARE_RESULT} from "~/utils/misc";

describe("Testing the Expense class", function () {

    it("sorting via the static comparator works as expected", function () {
        let first_expense = {...ten_expenses[0]};
        let second_expense = {...ten_expenses[1]};
        let third_expense = {...ten_expenses[2]};
        let expenses = [
            third_expense,
            second_expense,
            first_expense,
        ];

        expenses.sort(Expense.comparator);
        expect(expenses).toEqual([first_expense, second_expense, third_expense])

    });

    it("compare via the instance method", function () {
        let first_expense = {...ten_expenses[0]};
        let second_expense = {...ten_expenses[1]};
        expect(Expense.comparator(first_expense, second_expense)).toBe(COMPARE_RESULT.SMALLER);
        expect(Expense.comparator(second_expense, first_expense)).toBe(COMPARE_RESULT.LARGER);

        expect(Expense.comparator(first_expense, first_expense)).toBe(COMPARE_RESULT.EQUAL);
        expect(Expense.comparator(second_expense, second_expense)).toBe(COMPARE_RESULT.EQUAL)
    });
});

describe("test the expense validator", function () {

    it("valid expenses are valid", function () {
        let shouldntBoom = () => Expense.validate_throw(SINGLE_EXPENSE);
        expect(shouldntBoom).not.toThrow()

    });
    it("should throw on invalid expenses", function () {
        let invalidExpenses = [];
        let copy = {...SINGLE_EXPENSE};
        delete copy.id;
        invalidExpenses.push(copy);
        let copy2 = {...SINGLE_EXPENSE};
        copy2.timestamp_utc = '2017-10-29T09:18:21.853071';
        invalidExpenses.push(copy2);

        invalidExpenses.forEach(exp => {
            expect(() => Expense.validate_throw(exp)).toThrow()
        })

    });
});