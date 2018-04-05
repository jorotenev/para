import {Expense, IExpense} from "~/models/expense";
import {hashCode, ObservableProperty} from "~/utils/misc";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {hideKeyboard} from "~/utils/ui";
import {IExpenseDatabaseFacade} from "~/api_facade/db_facade";
import {RadDataForm} from "nativescript-ui-dataform";
import {Page} from "tns-core-modules/ui/page";
import {Button} from "tns-core-modules/ui/button";
import {getJSONForm} from "./form_properties_json"
import {DataStore} from "~/expense_datastore/datastore";
import moment = require("moment");
import {Observable} from "tns-core-modules/data/observable";
import {localize as l} from "nativescript-localize"

export const group_1 = " ";
export const group_2 = l('extra');
export const group_3 = "   ";

const dateFormat: string = "YYYY-MM-DD";
const timeFormat: string = "HH:mm";

/**
 * This interface contains the attributes which are available to the View
 */
export interface CommonExpenseViewModel {
    // used by RadDataForm to create the data form. contains field definitions
    metadata: object

    // the values is bind to an ActivityIndicator UI element
    activity: boolean

    // Update/Save
    actionBtnText: string

    // the dataform has collapsible field groups. the values below hold the names of these groups
    group_1: string
    group_2: string
    group_3: string

    // callback invoked when the user has pressed the action button
    btnPressed(): void

    // handy if the navigatingTo() wants to add more fields before assigning instance of this interface
    // as a bindingContext
    [key: string]: any
}

export function createViewModel(options: Constructor): CommonExpenseViewModel {

    if (options.mode === ExpenseFormMode.new) {
        return new NewExpenseHelper(options)
    } else if (options.mode === ExpenseFormMode.update) {
        return new UpdateExpenseHelper(options)
    }
}

/**
 * This view-model is reused for handling both "add new" and "update" expense forms.
 * It provides the metadata needed to create a RadDataForm, validates the
 * form and triggers a call to the appropriate API call (update()/persist(); indirectly, via our DataStore API)
 *
 */
abstract class _ExpenseViewModelHelper extends Observable implements CommonExpenseViewModel {
    private readonly raw_initial_expense: IExpense;

    private readonly mode: ExpenseFormMode;

    @ObservableProperty()
    public activity: boolean;

    // used to avoid unnecessary calls to the API if the object hasn't been updated but "Update" is pressed.
    private objectHash: number;

    private readonly dataform: RadDataForm;

    private onSuccessfulOperation: (IExpense) => void;

    public constructor(options: Constructor) {
        super();
        this.raw_initial_expense = {...options.expense};

        this.set('expense', this.convertForForm(options.expense));

        this.dataform = options.dataform;

        this.mode = options.mode;

        this.onSuccessfulOperation = options.onSuccessfulOperation;

        this.activity = false;

        this.objectHash = hashCode(JSON.stringify(this.get('expense')));
    }

    public get pageName() {
        return {
            [ExpenseFormMode.new]: l("add_expense"),
            [ExpenseFormMode.update]: l('update_expense')
        }[this.mode]
    }

    public get actionBtnText() {
        return {
            [ExpenseFormMode.new]: l("add_expense"),
            [ExpenseFormMode.update]: l('update_expense')
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
        hideKeyboard();
        const that = this;
        const dataform = this.dataform;
        const hackedAmount = fixedAmount(dataform.getPropertyByName("amount").valueCandidate);

        // using `bind()` because: https://stackoverflow.com/questions/34930771/why-is-this-undefined-inside-class-method-when-using-promises
        customFormValidation(dataform)
            .then(dataform.validateAndCommitAll.bind(dataform))
            .then((ok) => {
                if (ok) {
                    that.get('expense').amount = hackedAmount;
                    return that.get('expense')
                } else {
                    throw new Error("Form validation failed")
                }
            })
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
                if (err.showToUser) {
                    dialogs.alert({
                        message: err.msg || l("failed_perform_operation"),
                        title: "Error",
                        cancelable: true,
                        okButtonText: "Ok"
                    })
                }
                that.activity = false;
            })
    }

    /**
     * Executed when RadDataForm has flushed to the source (data) object.
     * i.e. when the data from the form is applied to our expense object.
     * The method will send the expense to the appropriate DataStore API (depending on whether we update an object
     * or create a new one)
     *
     * @param committedExpense
     */
    private onSuccessfullyCommitted(committedExpense: IExpense) {
        const that = this;
        const verb = {[ExpenseFormMode.update]: "update", [ExpenseFormMode.new]: "create"}[this.mode];
        if (this.objectHash === hashCode(JSON.stringify(committedExpense))) { //todo that's broken
            console.log("committed object is the same as the initial one. idling");
            return;
        }

        this.activity = true;

        let facade: IExpenseDatabaseFacade = DataStore.getInstance();
        let apiMethod = {
            [ExpenseFormMode.new]: () => facade.persist(committedExpense),
            [ExpenseFormMode.update]: () => facade.update(committedExpense, this.raw_initial_expense),
        }[this.mode];

        apiMethod().then(function (updatedExpense: IExpense) {
            that.objectHash = hashCode(JSON.stringify(updatedExpense));

            that.activity = false;

            console.log(`${verb} API call: ok`);
            that.onSuccessfulOperation(updatedExpense)
        }, function (err) {
            that.activity = false;
            dialogs.alert({
                title: l('couldnt_process_the_expense', verb),
                message: err.reason,
                okButtonText: "ок :("
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
        let exp: any = {...e};

        if (!exp.amount) {
            exp.amount = 0;
        }

        // reduce to an object with keys as trimmed tags. get just the keys via Object.keys()
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

    private extractTimestampUTC(expense: any) {
        let timeStr = moment(expense.time).format(timeFormat);
        let dateStr = moment(expense.date).format(dateFormat);

        let subMinuteSymbols = moment(this.raw_initial_expense.timestamp_utc).format("ss.SSS");
        let localDateTimeStr = `${dateStr}T${timeStr}:${subMinuteSymbols}`;
        let dateTimeUTCStr = moment(localDateTimeStr).utc();

        if (dateTimeUTCStr.isValid()) {
            return dateTimeUTCStr.toISOString()
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
        let candidateAmount = fixedAmount(dataform.getPropertyByName("amount").valueCandidate);
        if (!isNaN(candidateAmount)) { // if something's entered
            // needed because of https://github.com/telerik/nativescript-ui-feedback/issues/549
            if (candidateAmount < 0) {
                dataform.getPropertyByName("amount").errorMessage = l("negative_values_invalid");
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
                dataform.getPropertyByName(propName).errorMessage = l("at_least_one_required");
            }
            dataform.notifyValidated(propName, atLeastOne)
        });

        if (validated) {
            resolve();
            return
        } else {
            reject();
            return
        }
    })

}

function fixedAmount(badAmount) {
    // HACK. see https://github.com/telerik/nativescript-ui-feedback/issues/549
    let hackAmount = Number(String(badAmount));
    return hackAmount ? hackAmount : 0;
}