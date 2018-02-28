import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {ExpenseFormMode, viewModelFactory} from "~/expense/common/common";
import {RadDataForm} from "nativescript-ui-dataform";
import * as dialogs from "ui/dialogs";
import {DataStore} from "~/expense_datastore/datastore";
import {navigateTo} from "~/utils/nav";
import {IExpense} from "~/models/expense";

let page: Page;
let dataform: RadDataForm;
let expense;

export function navigatingTo(args: EventData) {
    page = <Page>args.object;
    expense = page.navigationContext.expense;
    dataform = <RadDataForm> page.getViewById('expense-form');
    let context = viewModelFactory({
        page: page,
        dataform: dataform,
        mode: ExpenseFormMode.update,
        expense: expense,
        onSuccessfulOperation: (newExpense: IExpense) => {
            console.log("updated expense with id " + newExpense.id);
            navigateTo({path: 'expense/list/list', backstackVisible: false});
        }
    })
    page.bindingContext = context

}

export function deleteExpense() {
    dialogs.confirm("Are you sure you want to delete this expense?").then((confirmed) => {
        if (confirmed) {
            DataStore.getInstance().remove(expense).then(() => {
                console.log("deleted")
                navigateTo({path: "expense/list/list", clearHistory: true, fromDrawer: false})
            }, (err) => {
                console.dir(err)
                dialogs.alert("Couldn't delete the expense")
            })

        } else {
            console.log("not confirmed")
        }
    })
}


