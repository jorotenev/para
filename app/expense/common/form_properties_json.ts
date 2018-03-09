import {IExpense} from "~/models/expense";
import {ExpenseFormMode, group_1, group_2} from "~/expense/common/common";
import {getCurrencies} from "~/utils/money";
import {localize as l} from "nativescript-localize";

export function metadataForCurrency(options) {
    let opts = {
        includeGroup: true,
        groupName: "",
        index: 0,
        displayName: "",
        columnIndex: 0,
        hintText: "",
        name: 'currency',
        ...options
    };
    let res = {
        // groupName: opts.groupName,

        displayName: opts.displayName,
        name: opts.name,
        editor: 'Picker',
        index: opts.index,
        columnIndex: opts.columnIndex,
        hintText: opts.hintText,
        required: true,
        validators: [],
        valuesProvider: prepareCurrencyObject(getCurrencies()),
    };
    if (opts.includeGroup) {
        res['groupName'] = opts.groupName
    }
    return res
}

export function getJSONForm(expense: IExpense, mode = ExpenseFormMode.update) {
    return {
        propertyAnnotations: [
            {
                groupName: group_1,

                displayName: "",
                name: 'name',
                hintText: l('expense_description'),
                index: 0
            },
            //
            {
                groupName: group_1,
                displayName: "",
                name: 'amount',
                hintText: '0.0',
                index: 1,
                columnIndex: 0,
                editor: 'Number'
            },
            metadataForCurrency({index: 1, columnIndex: 1, groupName: group_2}),
            {
                groupName: group_2,

                displayName: l('time'),
                name: 'time',
                index: 2,
                columnIndex: 0,
                editor: 'TimePicker'
            },
            {
                groupName: group_2,

                name: 'date',
                displayName: l('date'),
                index: 2,
                columnIndex: 1,
                editor: "DatePicker"
            },
            //
            {
                groupName: group_1,
                displayName: "",
                hintText: l('tags_description'),
                name: 'tags',
                index: 2,
                editor: "Text" // TODO text is not good enough.
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