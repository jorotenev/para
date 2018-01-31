import {EventData} from "tns-core-modules/data/observable";
import {Page} from "tns-core-modules/ui/page";
import {ExpenseFormMode, viewModelFactory} from "~/expense/common/common";
import {RadDataForm} from "nativescript-pro-ui/dataform";
import {Expense, IExpense} from "~/models/expense";


let page: Page;

export function navigatingTo(args: EventData) {
    page = <Page> args.object;

    page = <Page>args.object;
    let comingFromDrawer: boolean = !!page.navigationContext.fromDrawer;
    let navigationBtnType: string = comingFromDrawer ? 'back' : "drawer"

    let expense: IExpense = Expense.createEmptyExpense();
    let dataform = <RadDataForm> page.getViewById('expense-form');

    let viewModel = viewModelFactory({

        page: page,
        dataform: dataform,
        mode: ExpenseFormMode.new,
        expense: expense,
        onSuccessfulOperation: (newExpense: IExpense) => {
            console.log("created a new expense with id " + newExpense.id)
            // navigateTo('expense/list/list');
        }
    });
    viewModel.navigationBtnType = navigationBtnType
    page.bindingContext = viewModel


}
