import {Observable} from "tns-core-modules/data/observable";
import {IExpense} from "~/models/expense";
import {PropertyConverter} from "nativescript-pro-ui/dataform";

export class SingleExpenseModel extends Observable {
    private _expense;

    constructor(exp: IExpense) {
        super();
        this.expense = exp;
        this.tagsConverter = new TagsConverter();
    }

    set expense(value: IExpense) {
        this.set("_expense", value);
    }


    get expense(): IExpense {
        return this.get("_expense");
    }


    set tagsConverter(converter: TagsConverter) {
        this.set("_tagsConverter", converter)
    }

    get tagsConverter(): TagsConverter {
        return this.get("_tagsConverter")
    }
    get currencies(){
        return ["EUR", "BGN", "USD"];
    }

}


export class TagsConverter implements PropertyConverter {
    convertFrom(source: string[]): any {
        return source.join(", ")
    }

    convertTo(source: string): any {
        return source.split(",").map(value => value.trim());
    }
}

