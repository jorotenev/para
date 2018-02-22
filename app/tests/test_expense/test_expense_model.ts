import {Expense} from "~/models/expense";
import {ten_expenses} from "~/tests/test_api_facade/sample_responses";
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
        ten_expenses.forEach((exp) => {
            expect(() => Expense.validate_throw(exp)).not.toThrow();
        });
    });

    it("should throw on invalid expenses", function () {
        let invalidExpenses = [];
        // sanity checking
        ten_expenses.forEach((exp) => {
            expect(() => Expense.validate_throw(exp)).not.toThrow();

            let copy = {...exp};
            delete copy.id;
            invalidExpenses.push(copy);
            let copy2 = {...exp};
            copy2.timestamp_utc = '2017-10-29T09:18:21.853071';
            invalidExpenses.push(copy2);
            let copy3 = {...exp};
            copy3.tags = ['a', 'a'];
            invalidExpenses.forEach(exp => {
                expect(() => Expense.validate_throw(exp)).toThrow()
            })
        })


    });
});