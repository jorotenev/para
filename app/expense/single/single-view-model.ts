import {Observable} from "tns-core-modules/data/observable";
import {IExpense} from "~/models/expense";
import {PropertyConverter} from "nativescript-pro-ui/dataform";
import {getCurrencies} from "~/utils/money";

function prepareCurrencyObject(raw) {
    return Object.keys(raw).map((key) => {
        return {
            key: key,
            label: raw[key]
        }
    })
}

export class SingleExpenseModel extends Observable {
    private _expense;
    private _currencies;

    constructor(exp: IExpense) {
        super();
        this.expense = exp;


        this._currencies = prepareCurrencyObject(getCurrencies())
    }

    set expense(value: IExpense) {
        this.set("_expense", value);
    }


    get expense(): IExpense {
        return this.get("_expense");
    }


    get currencies() {
        return this._currencies
    }


}


class CurrencyConverter implements PropertyConverter {

    constructor(private currencyObject) {
    }

    convertFrom(source: any): any {
        return this.currencyObject.filter((obj) => {
            return obj.key === source
        })[0].label
    }

    convertTo(source: any): any {
        return this.currencyObject.filter((obj) => {
            return obj.label === source
        })[0].key
    }

}