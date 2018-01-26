import {Expense, ExpenseConstructor, IExpense} from "~/models/expense";
import {getCurrencies} from "~/utils/money";
import {hashCode} from "~/utils/misc";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {toggleActivityIndicator} from "~/utils/ui";
import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import {Page} from "tns-core-modules/ui/page";
import {Button} from "tns-core-modules/ui/button";

let moment = require("moment");

export const group_1 = " ";
export const group_2 = "Extra";
export const group_3 = "   ";

const dateFormat: string = "YYYY-MM-D";
const timeFormat: string = "HH:mm";

abstract class _ExpenseViewModelHelper {
    private activityIndicator: ActivityIndicator;
    private initialObjectHash: number;
    public readonly expense: IExpense;
    public readonly mode: ExpenseFormMode;

    private readonly dataform: RadDataForm;
    private readonly page: Page;

    public constructor(options: Constructor) {
        this.expense = options.expense;
        this.dataform = options.dataform;
        this.page = options.page;
        this.mode = options.mode;

        this.activityIndicator = <ActivityIndicator> this.page.getViewById('busy-ind');
        if (!this.activityIndicator) {
            throw new Error("no activity indicator on page")
        }
        let btn = <Button> this.page.getViewById('actionBtn')
        if (!btn) {
            throw new Error("no action btn")
        }

        btn.on(Button.tapEvent, this.updatePressed, this)

        this.expense = convertForForm(this.expense);
        this.initialObjectHash = hashCode(JSON.stringify(this.expense))

    }

    public get actionBtnText() {
        return {
            [ExpenseFormMode.new]: "Add expense",
            [ExpenseFormMode.update]: "Update expense"
        }[this.mode]
    }

    public get group_1() {
        return group_1;
    }

    public get group_2() {
        return group_2
    }

    public get group_3() {
        return group_3;
    }

    public get metadata() {
        return getJSONForm(this.expense, this.mode)
    }

    public updatePressed() {
        const that = this;
        const dataform = this.dataform;
        let activityIndicator = this.activityIndicator;
        if (validate(dataform)) {

            dataform.validateAndCommitAll().then(function (ok) {
                    if (ok) {

                        let expense = convertFromForm(JSON.parse(dataform.editedObject))
                        if (that.initialObjectHash === hashCode(JSON.stringify(expense))) {
                            console.log('same object, not making an API call')
                            return;
                        }
                        console.log("saving...")
                        console.dir(expense)
                        toggleActivityIndicator(activityIndicator, true);

                        new ExpenseDatabaseFacade().update(expense).then(function (ok) {
                            that.initialObjectHash = hashCode(JSON.stringify(expense))

                            toggleActivityIndicator(activityIndicator, false)
                        }, function (err) {
                            toggleActivityIndicator(activityIndicator, false)
                            dialogs.alert({
                                title: "Couldn't update the expense",
                                message: err.reason,
                                okButtonText: "Oh..."
                            })
                        })
                    }
                }, console.error
            )
        }
    }
}

export class Constructor {
    page: Page
    dataform: RadDataForm
    expense: IExpense
    mode: ExpenseFormMode

}

export class UpdateExpenseHelper extends _ExpenseViewModelHelper {

}

export enum ExpenseFormMode {
    new,
    update
}

function validate(dataform: RadDataForm) {
    // >> validate the amount
    let validated = true;

    let candidateAmount = dataform.getPropertyByName('amount').valueCandidate
    let amountIsValid = true;
    if (!!candidateAmount) { // if something's entered
        if (candidateAmount < 0) {
            dataform.getPropertyByName("amount").errorMessage = "Negative values are invalid"
            amountIsValid = false;
            validated = false;
        }
        dataform.notifyValidated('amount', amountIsValid)

    }
    // << validate amount

    return validated;
}

function getJSONForm(expense: IExpense, mode = ExpenseFormMode.update) {
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

function convertForForm(expense: IExpense) {
    let copy: any = {...expense};
    copy.date = moment(copy.timestamp_utc).valueOf();
    copy.time = moment(copy.timestamp_utc).valueOf();
    copy.tags = copy.tags.join(",");
    delete copy.timestamp_utc;

    return copy;
}

function convertFromForm(e: any): IExpense {
    let temp: IExpense = {...e};
    temp.amount = !!temp.amount ? temp.amount : 0;
    temp.tags = e.tags.split(",").map((tag) => tag.trim());
    let time_str = moment(e.time).format(timeFormat)
    let date_str = moment(e.date).format(dateFormat)
    let dateTimeUTC = moment(`${date_str} ${time_str}`).utc().format();
    temp.timestamp_utc = dateTimeUTC;
    let prepared: ExpenseConstructor = temp;
    let expense: IExpense = new Expense(prepared);
    return expense
}


function prepareCurrencyObject(raw) {
    return Object.keys(raw).map((key) => {
        return {
            key: key,
            label: raw[key]
        }
    })
}