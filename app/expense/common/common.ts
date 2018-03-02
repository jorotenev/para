import {Expense, IExpense} from "~/models/expense";
import {hashCode} from "~/utils/misc";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {toggleActivityIndicator} from "~/utils/ui";
import {IExpenseDatabaseFacade} from "~/api_facade/db_facade";
import {RadDataForm} from "nativescript-ui-dataform";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import {Page} from "tns-core-modules/ui/page";
import {Button} from "tns-core-modules/ui/button";
import {getJSONForm} from "./form_properties_json"
import {DataStore} from "~/expense_datastore/datastore";
import moment = require("moment");
import {Observable} from "tns-core-modules/data/observable";

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
    // expense: IExpense
    actionBtnText: string
    group_1: string
    group_2: string
    group_3: string

    btnPressed(): void

    [key: string]: any
}

abstract class _ExpenseViewModelHelper extends Observable implements CommonExpenseViewModel {

    // public _expense: IExpense;

    private readonly raw_initial_expense: IExpense;
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
        super();
        this.raw_initial_expense = {...options.expense};
        this.initialTimestampUTC = this.raw_initial_expense.timestamp_utc;

        this.set('expense', this.convertForForm(options.expense))

        this.dataform = options.dataform;
        this.page = options.page;
        this.mode = options.mode;
        this.onSuccessfulOperation = options.onSuccessfulOperation;
        this.activityIndicator = <ActivityIndicator> this.page.getViewById('busy-ind');
        if (!this.activityIndicator) {
            throw new Error("no activity indicator on page")
        }
        let btn = <Button> this.page.getViewById('actionBtn');
        if (!btn) {
            throw new Error("no action btn")
        }

        btn.on(Button.tapEvent, this.btnPressed, this);


        this.objectHash = hashCode(JSON.stringify(this.get('expense')));
    }

    public get pageName() {
        return {
            [ExpenseFormMode.new]: "Add an expense",
            [ExpenseFormMode.update]: "Update an expense"
        }[this.mode]
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
        return getJSONForm(this.get('expense'), this.mode)
    }

    public btnPressed() {
        const that = this;
        const dataform = this.dataform;
        let hackAmount = Number(String(that.dataform.getPropertyByName("amount").valueCandidate));

        const applyHackIfOkValidation = (ok) => {
            // HACK https://github.com/telerik/nativescript-ui-feedback/issues/549
            console.log('hackAmount' + hackAmount)
            if (ok) {
                that.get('expense').amount = hackAmount ? hackAmount : 0;
                return Promise.resolve(that.get('expense'))
            } else {
                return Promise.reject("Form validation failed")
            }
        };

        // fml https://stackoverflow.com/questions/34930771/why-is-this-undefined-inside-class-method-when-using-promises
        customFormValidation(dataform)
            .then(dataform.validateAndCommitAll.bind(dataform))
            .then(applyHackIfOkValidation.bind(this))
            .then(this.convertFromForm.bind(this))
            .then((exp) => {
                try {
                    return Expense.validate_throw(exp)
                } catch (err) {
                    throw {
                        showToUser: true,
                        msg: err
                    }
                }
            })
            .then(this.onSuccessfullyCommitted.bind(this))
            .catch(err => {
                console.dir(err);
                if (err.showToUser) {
                    dialogs.alert({
                        message: err.msg || "Failed to perform operation",
                        title: "Failed",
                        cancelable: true,
                        okButtonText: "Ok"
                    })
                }
                toggleActivityIndicator(that.activityIndicator, false);
            })
    }


    private onSuccessfullyCommitted(committedExpense) {
        const that = this;
        const verb = {[ExpenseFormMode.update]: "update", [ExpenseFormMode.new]: "create"}[this.mode];
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
            [ExpenseFormMode.update]: () => facade.update(committedExpense, this.raw_initial_expense),
        }[this.mode];

        apiMethod().then(function (updatedExpense: IExpense) {
            that.objectHash = hashCode(JSON.stringify(updatedExpense));

            toggleActivityIndicator(that.activityIndicator, false);
            console.log(`${verb} API call: ok`);
            that.onSuccessfulOperation(updatedExpense)

        }, function (err) {
            console.dir(err);
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
        let exp: any = {...e};

        if (!exp.amount) {
            exp.amount = 0;
        }

        // reduce to an object with keys as trimmed tags. get just they keys via Object.keys()
        exp.tags = Object.keys(e.tags.split(",").reduce(function (previousValue, currentValue) {
            let t = currentValue.trim();
            if (t) {
                return {...previousValue, [t]: 0}
            } else {
                return previousValue
            }
        }, {}));

        exp.timestamp_utc = this.extractTimestampUTC(e);
        delete exp.date;
        delete exp.time;

        return exp
    }

    private extractTimestampUTC(e: any) {
        let timeStr = moment(e.time).format(timeFormat);
        let dateStr = moment(e.date).format(dateFormat);
        let subMinuteSymbols = moment(this.initialTimestampUTC).format("ss.SSS");
        let localTimeStr = `${dateStr}T${timeStr}:${subMinuteSymbols}`;
        let dateTimeUTC = moment(localTimeStr).utc();
        console.log(`localTimeStr ${localTimeStr}`);
        if (dateTimeUTC.isValid()) {
            console.log(`returning ${dateTimeUTC.toISOString()}`);
            return dateTimeUTC.toISOString()
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
    page: Page;
    dataform: RadDataForm;
    expense: IExpense;
    mode: ExpenseFormMode;
    onSuccessfulOperation?: (IExpense) => void = () => undefined // default implementation
}


export enum ExpenseFormMode {
    new = 'new',
    update = 'update'
}

function customFormValidation(dataform: RadDataForm): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let validated = true;
        // >> validate the amount
        let amountIsValid = true;
        let candidateAmount = Number(String(dataform.getPropertyByName('amount').valueCandidate));
        if (!isNaN(candidateAmount)) { // if something's entered
            // needed because of https://github.com/telerik/nativescript-ui-feedback/issues/549
            if (candidateAmount < 0) {
                dataform.getPropertyByName("amount").errorMessage = "Negative values are invalid";
                validated = amountIsValid = false;
            }
        }
        dataform.notifyValidated('amount', amountIsValid);
        if (!validated) {
            reject();
            return;
        }
        // << validated the amount


        let candidateName = dataform.getPropertyByName('name').valueCandidate;
        let atLeastOne = validated = !!candidateName || !!candidateAmount;

        ['amount', 'name'].forEach(propName => {
            if (!atLeastOne) {
                dataform.getPropertyByName(propName).errorMessage = "At least one of the properties is required";
            }
            dataform.notifyValidated(propName, atLeastOne)
        });

        if (validated) {
            console.log("validatedddd");
            resolve();
            return
        } else {
            console.log("faileddd");
            reject();
            return
        }
    })

}