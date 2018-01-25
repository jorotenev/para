import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {SingleExpenseModel} from "./single-view-model";
import {Expense, ExpenseConstructor, IExpense} from "~/models/expense";
import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import * as dialogs from "ui/dialogs";
import {toggleActivityIndicator} from "~/utils/ui";

let moment = require("moment");
let page: Page;
let dataform;
let expense;
const dateFormat: string = "YYYY-MM-D";
const timeFormat: string = "HH:mm";
let activityIndicator: ActivityIndicator;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    activityIndicator = <ActivityIndicator> page.getViewById('busy-ind')
    expense = page.navigationContext.expense;
    expense = prepareExpenseObject(expense);
    dataform = page.getViewById('expenseEditForm');
    page.bindingContext = new SingleExpenseModel(expense)
}

function prepareExpenseObject(expense: IExpense) {
    let copy: any = {...expense};
    copy.date = moment(copy.timestamp_utc).format(dateFormat);
    copy.time = moment(copy.timestamp_utc).format(timeFormat);
    copy.tags = copy.tags.join(",");
    delete copy.timestamp_utc;

    return copy;
}

function prepareExpense(e: any): IExpense {
    let temp: IExpense = {...e};
    temp.amount = !!temp.amount ? temp.amount : 0;
    temp.tags = e.tags.split(",").map((tag) => tag.trim());
    let dateTime = moment(`${e.date} ${e.time}`, `${dateFormat} ${timeFormat}`);
    temp.timestamp_utc = dateTime.utc().format();
    let prepared: ExpenseConstructor = temp;
    let expense: IExpense = new Expense(prepared);
    return expense
}


export function updatePressed() {
    if (validate()) {

        dataform.validateAndCommitAll().then(function (ok) {
                if (ok) {

                    let expense = prepareExpense(JSON.parse(dataform.editedObject))

                    toggleActivityIndicator(activityIndicator, true);

                    new ExpenseDatabaseFacade().update(expense).then(function (ok) {
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

function validate() {
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

