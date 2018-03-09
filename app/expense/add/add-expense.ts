import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {ExpenseFormMode, viewModelFactory} from "~/expense/common/common";
import {RadDataForm} from "nativescript-ui-dataform";
import {Expense, IExpense} from "~/models/expense";
import {navigateTo} from "~/utils/nav";
import {hideKeyboard} from "~/utils/ui";


let page: Page;

export function navigatingTo(args: EventData) {
    hideKeyboard()

    page = <Page>args.object;
    let comingFromDrawer: boolean = !!page.navigationContext.fromDrawer;
    let navigationBtnType: string = comingFromDrawer ? "back" : "drawer";

    let expense: IExpense = Expense.createEmptyExpense();
    let dataform = <RadDataForm> page.getViewById('expense-form');

    let viewModel = viewModelFactory({

        page: page,
        dataform: dataform,
        mode: ExpenseFormMode.new,
        expense: expense,
        onSuccessfulOperation: (newExpense: IExpense) => {
            console.log("created a new expense with id " + newExpense.id);
            navigateTo({path: 'expense/list/list', clearHistory: true, backstackVisible: false});
        }
    });
    viewModel.navigationBtnType = navigationBtnType;
    page.bindingContext = viewModel
}
