import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {ExpenseFormMode, createViewModel} from "~/expense/common/common";
import {RadDataForm} from "nativescript-ui-dataform";
import * as dialogs from "ui/dialogs";
import {DataStore} from "~/expense_datastore/datastore";
import {navigateTo} from "~/utils/nav";
import {IExpense} from "~/models/expense";
import {hideKeyboard} from "~/utils/ui";
import {localize as l} from "nativescript-localize";
import {Button} from "tns-core-modules/ui/button";

let page: Page;
let dataform: RadDataForm;
let expense;

export function navigatingTo(args: EventData) {
    hideKeyboard();

    page = <Page>args.object;
    expense = page.navigationContext.expense;
    dataform = <RadDataForm> page.getViewById('expense-form');
    let viewModel = createViewModel({
        dataform: dataform,
        mode: ExpenseFormMode.update,
        expense: expense,
        onSuccessfulOperation: (newExpense: IExpense) => {
            console.log("updated expense with id " + newExpense.id);
            navigateTo({path: 'expense/list/list', backstackVisible: false});
        }
    });
    let btn: Button = <Button> page.getViewById('actionBtn');
    if (!btn) {
        throw new Error("no action btn")
    }
    // what to do when the action btn (Save/Update) is pressed
    btn.on(Button.tapEvent, viewModel.btnPressed, viewModel);

    page.bindingContext = viewModel

}

export function deleteExpense() {
    dialogs.confirm(l("confirm_delete_expense")).then((confirmed) => {
        if (confirmed) {
            DataStore.getInstance().remove(expense).then(() => {
                console.log("deleted");
                navigateTo({path: "expense/list/list", clearHistory: true, fromDrawer: false})
            }, (err) => {
                console.dir(err);
                dialogs.alert(l("couldnt_delete_expense"))
            })

        } else {
            console.log("not confirmed")
        }
    })
}


