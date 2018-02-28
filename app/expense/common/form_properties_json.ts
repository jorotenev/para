import {IExpense} from "~/models/expense";
import {ExpenseFormMode, group_1, group_2} from "~/expense/common/common";
import {getCurrencies} from "~/utils/money";

export function metadataForCurrency(options) {
    let opts = {
        groupName: "",
        index: 0,
        displayName: "",
        columnIndex: 0,
        hintText: "",
        name: 'currency',
        ...options
    };
    return {
        groupName: opts.groupName,

        displayName: opts.displayName,
        name: opts.name,
        editor: 'Picker',
        index: opts.index,
        columnIndex: opts.columnIndex,
        hintText: opts.hintText,
        required: true,
        validators: [],
        valuesProvider: prepareCurrencyObject(getCurrencies()),
    }
}

export function getJSONForm(expense: IExpense, mode = ExpenseFormMode.update) {
    return {
        // commitMode: "Manual",
        // validationMode: "Manual",
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
                editor: 'Number',
                // validators:[
                //     {
                //         name:"RangeValidator",
                //         params:{
                //             minimum:1,
                //             maximum:10000000
                //         }
                //     }
                // ]
            },
            metadataForCurrency({index: 1, columnIndex: 1, groupName: group_2}),
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
            },
            {
                name: 'timestamp_utc_updated',
                ignore: true
            },
            {
                name: 'timestamp_utc_created',
                ignore: true,

            }
        ] // << propertyAnnotations

    };
}

function prepareCurrencyObject(raw) {
    return Object.keys(raw)
}