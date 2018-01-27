import {IExpense} from "~/models/expense";
import {ExpenseFormMode, group_1, group_2} from "~/expense/common/common";
import {getCurrencies} from "~/utils/money";

export function getJSONForm(expense: IExpense, mode = ExpenseFormMode.update) {
    return {
        commitMode: "Manual",
        validationMode: "Manual",
        propertyAnnotations: [
            {
                groupName: group_1,

                name: 'name',
                hintText: "Expense description",
                index: 0
            },
            //
            {
                groupName: group_1,

                name: 'amount',
                hintText: '0.0',
                index: 1,
                columnIndex: 0,
                editor: 'Number'
            },
            {
                groupName: group_2,

                name: 'currency',
                editor: 'Picker',
                index: 1,
                columnIndex: 1,
                valuesProvider: prepareCurrencyObject(getCurrencies()),
            },
            {
                groupName: group_2,

                name: 'time',
                index: 2,
                columnIndex: 0,
                editor: 'TimePicker'
            },
            {
                groupName: group_2,

                name: 'date',
                index: 2,
                columnIndex: 1,
                editor: "DatePicker"
            },
            //
            {
                groupName: group_1,

                name: 'tags',
                index: 2,
                editor: "Text"
            },
            {
                name: 'id',
                ignore: true,
                hide: true
            },
            {
                name: 'timestamp_utc',
                ignore: true,
                hide: true
            }
        ] // << propertyAnnotations

    };
}

function prepareCurrencyObject(raw) {
    return Object.keys(raw)
}