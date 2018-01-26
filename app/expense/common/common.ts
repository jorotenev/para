import {Expense, ExpenseConstructor, IExpense} from "~/models/expense";
import {hashCode} from "~/utils/misc";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {toggleActivityIndicator} from "~/utils/ui";
import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import {Page} from "tns-core-modules/ui/page";
import {Button} from "tns-core-modules/ui/button";
import moment = require("moment");
import {getJSONForm} from "./form_properties_json"

export const group_1 = " ";
export const group_2 = "Extra";
export const group_3 = "   ";

const dateFormat: string = "YYYY-MM-D";
const timeFormat: string = "HH:mm";

abstract class _ExpenseViewModelHelper {
    public expense: IExpense;
    public readonly mode: ExpenseFormMode;

    private activityIndicator: ActivityIndicator;
    // first it's the initial object; if the object is successfully updated, the hash is also updated
    // used to determine whether or not to make an HTTP API request (reduce unnecessary API calls)
    private objectHash: number;
    private initialTimestampUTC: string;
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
        let btn = <Button> this.page.getViewById('actionBtn');
        if (!btn) {
            throw new Error("no action btn")
        }

        btn.on(Button.tapEvent, this.updatePressed, this);


        this.objectHash = hashCode(JSON.stringify(this.expense));
        this.initialTimestampUTC = this.expense.timestamp_utc

        this.expense = this.convertForForm(this.expense);

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
        if (validate(dataform)) {
            dataform.validateAndCommitAll().then((ok) => {
                if (ok) {
                    this.onSuccessfullyCommitted()
                } else{
                    console.error("couldnt validated/commit")
                }
            }, (err) => {
                console.log('error')
            })
        } else {
            console.log("didn't pass manual validation")
        }
    }


    private onSuccessfullyCommitted() {
        const that = this;
        const verb = {[ExpenseFormMode.update]: "update", [ExpenseFormMode.new]: "create"}[this.mode]

        let expense;
        try {
            let parsed = JSON.parse(this.dataform.editedObject)
            expense = this.convertFromForm(parsed)
        } catch (err) {
            console.error(err)
            dialogs.alert({title: `Couldn't ${verb} the expense`})
            return;
        }

        if (this.objectHash === hashCode(JSON.stringify(expense))) {
            return;
        }

        toggleActivityIndicator(this.activityIndicator, true);

        new ExpenseDatabaseFacade().update(expense).then(function (updatedExpense: IExpense) {
            that.objectHash = hashCode(JSON.stringify(updatedExpense))

            toggleActivityIndicator(that.activityIndicator, false)
        }, function (err) {
            toggleActivityIndicator(that.activityIndicator, false)
            dialogs.alert({
                title: `Couldn't ${verb} the expense`,
                message: err.reason,
                okButtonText: "cool :("
            })
        })
    }

    private convertForForm(expense: IExpense) {
        let copy: any = {...expense};
        copy.date = moment(copy.timestamp_utc).valueOf();
        copy.time = moment(copy.timestamp_utc).valueOf();
        copy.tags = copy.tags.join(",");
        delete copy.timestamp_utc;

        return copy;
    }

    private convertFromForm(e: any): IExpense {
        try {
            let temp: IExpense = {...e};
            temp.amount = !!temp.amount ? temp.amount : 0;
            temp.tags = e.tags.split(",").map((tag) => tag.trim());

            temp.timestamp_utc = this.extractTimestampUTC(e);

            let prepared: ExpenseConstructor = temp;
            let expense: IExpense = new Expense(prepared);
            return expense
        } catch (err) {
            console.log('couldn\'t convert ' + err);
            return null;
        }
    }

    private extractTimestampUTC(e: any) {
        let timeStr = moment(e.time).format(timeFormat)
        let dateStr = moment(e.date).format(dateFormat)
        let subMinuteSymbols = moment(this.initialTimestampUTC).format("ss.SSS")
        let localTimeStr = `${dateStr}T${timeStr}:${subMinuteSymbols}`;
        let dateTimeUTC = moment(localTimeStr).utc();
        if (dateTimeUTC.isValid()) {
            return dateTimeUTC.format()
        } else {
            throw new Error("couldn't convert to a utc timestamp")
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
