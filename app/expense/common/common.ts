import {Expense, IExpense} from "~/models/expense";
import {hashCode} from "~/utils/misc";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {toggleActivityIndicator} from "~/utils/ui";
import {IExpenseDatabaseFacade} from "~/api_facade/db_facade";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import {Page} from "tns-core-modules/ui/page";
import {Button} from "tns-core-modules/ui/button";
import {getJSONForm} from "./form_properties_json"
import {DataStore} from "~/expense_datastore/datastore";
import moment = require("moment");

export const group_1 = " ";
export const group_2 = "Extra";
export const group_3 = "   ";

const dateFormat: string = "YYYY-MM-DD";
const timeFormat: string = "HH:mm";


export function viewModelFactory(options: Constructor): CommonExpenseViewModel {
    if (options.mode === ExpenseFormMode.new) {
        return new NewExpenseHelper(options)
    } else if (options.mode === ExpenseFormMode.update) {
        return new UpdateExpenseHelper(options)
    }
}

export interface CommonExpenseViewModel {
    metadata: object
    expense: IExpense
    actionBtnText: string
    group_1: string
    group_2: string
    group_3: string

    updatePressed(): void

    [key: string]: any
}

abstract class _ExpenseViewModelHelper implements CommonExpenseViewModel {
    private _expense: IExpense;
    private readonly mode: ExpenseFormMode;

    private activityIndicator: ActivityIndicator;
    // first it's the initial object; if the object is successfully updated, the hash is also updated
    // used to determine whether or not to make an HTTP API request (reduce unnecessary API calls)
    private objectHash: number;
    private initialTimestampUTC: string;
    private readonly dataform: RadDataForm;
    private readonly page: Page;

    private onSuccessfulOperation: (IExpense) => void;

    public constructor(options: Constructor) {
        this._expense = options.expense;
        this.dataform = options.dataform;
        this.page = options.page;
        this.mode = options.mode;
        this.onSuccessfulOperation = options.onSuccessfulOperation
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

    public get expense() {
        return this._expense
    }

    public set expense(_e) {
        this._expense = _e
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
        if (validate(dataform)) { // manually validate
            dataform.validateAndCommitAll().then((ok) => { //validate via raddataform & attempt to commit
                if (ok) {
                    this.onSuccessfullyCommitted()
                } else {
                    console.error("couldnt validated/commit")
                }
            }, (err) => {
                console.dir(err)
            })
        } else {
            console.log("didn't pass manual validation")
        }
    }


    private onSuccessfullyCommitted() {
        const that = this;
        const verb = {[ExpenseFormMode.update]: "update", [ExpenseFormMode.new]: "create"}[this.mode];

        let committedExpense;
        try {
            committedExpense = this.convertFromForm(JSON.parse(this.dataform.editedObject))
        } catch (err) {
            console.error(err);
            dialogs.alert(`Couldn't ${verb} the expense`);
            toggleActivityIndicator(that.activityIndicator, false);

            return;
        }

        if (this.objectHash === hashCode(JSON.stringify(committedExpense))) { //todo that's broken
            console.log("committed object is the same as the initial one. idling");
            return;
        }

        toggleActivityIndicator(this.activityIndicator, true);
        console.log(`about to ${this.mode}...`);
        console.dir(committedExpense);
        let facade: IExpenseDatabaseFacade = DataStore.getInstance();
        let apiMethod = {
            [ExpenseFormMode.new]: () => facade.persist(committedExpense),
            [ExpenseFormMode.update]: () => facade.update(committedExpense),
        }[this.mode];

        apiMethod().then(function (updatedExpense: IExpense) {
            that.objectHash = hashCode(JSON.stringify(updatedExpense));

            toggleActivityIndicator(that.activityIndicator, false);
            console.log(`${verb} API call: ok`)
            that.onSuccessfulOperation(updatedExpense)

        }, function (err) {
            toggleActivityIndicator(that.activityIndicator, false);
            dialogs.alert({
                title: `Couldn't ${verb} the expense`,
                message: err.reason,
                okButtonText: "cool :("
            })
        })
    }

    private convertForForm(expense: IExpense) {
        let copy: any = {...expense};

        console.log("original timestamp " + copy.timestamp_utc)
        console.log(moment(copy.timestamp_utc).format());
        copy.date = moment(copy.timestamp_utc).valueOf();
        copy.time = moment(copy.timestamp_utc).valueOf();

        copy.tags = copy.tags.join(",");
        delete copy.timestamp_utc;

        return copy;
    }


    private convertFromForm(e: any): IExpense {
        let exp: IExpense = {...e};
        exp.amount = !!exp.amount ? exp.amount : 0;
        exp.tags = e.tags.split(",").map((tag) => tag.trim());

        exp.timestamp_utc = this.extractTimestampUTC(e);

        return new Expense(exp)
    }

    private extractTimestampUTC(e: any) {
        let timeStr = moment(e.time).format(timeFormat);
        let dateStr = moment(e.date).format(dateFormat);
        let subMinuteSymbols = moment(this.initialTimestampUTC).format("ss.SSS")
        let localTimeStr = `${dateStr}T${timeStr}:${subMinuteSymbols}`;
        let dateTimeUTC = moment(localTimeStr).utc();
        console.log(localTimeStr)
        if (dateTimeUTC.isValid()) {
            return dateTimeUTC.format()
        } else {
            throw new Error("couldn't convert to a utc timestamp")
        }
    }
}

class UpdateExpenseHelper extends _ExpenseViewModelHelper {

}

class NewExpenseHelper extends _ExpenseViewModelHelper {

}

export class Constructor {
    page: Page
    dataform: RadDataForm
    expense: IExpense
    mode: ExpenseFormMode
    onSuccessfulOperation?: (IExpense) => void = () => undefined // default implementation
}


export enum ExpenseFormMode {
    new = 'new',
    update = 'update'
}

function validate(dataform: RadDataForm) {

    let validated = true;
    // >> validate the amount
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
