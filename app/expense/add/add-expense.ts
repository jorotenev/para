import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {ExpenseFormMode, createViewModel} from "~/expense/common/common";
import {RadDataForm} from "nativescript-ui-dataform";
import {Expense, IExpense} from "~/models/expense";
import {navigateTo} from "~/utils/nav";
import {hideKeyboard} from "~/utils/ui";
import {Button} from "tns-core-modules/ui/button";


let page: Page;

export function navigatingTo(args: EventData) {
    hideKeyboard();

    page = <Page>args.object;
    let btn: Button = <Button> page.getViewById('actionBtn');
    if (!btn) {
        throw new Error("no action btn")
    }
    let comingFromDrawer: boolean = !!page.navigationContext.fromDrawer;
    let navigationBtnType: string = comingFromDrawer ? "back" : "drawer";

    let expense: IExpense = Expense.createEmptyExpense();
    let dataform = <RadDataForm> page.getViewById('expense-form');

    let viewModel = createViewModel({
        dataform: dataform,
        mode: ExpenseFormMode.new,
        expense: expense,
        onSuccessfulOperation: (newExpense: IExpense) => {
            console.log("created a new expense with id " + newExpense.id);
            navigateTo({path: 'expense/list/list', clearHistory: true, backstackVisible: false});
        }
    });

    // what to do when the action btn (Save/Update) is pressed
    btn.on(Button.tapEvent, viewModel.btnPressed, viewModel);
    viewModel.navigationBtnType = navigationBtnType;
    page.bindingContext = viewModel
}
