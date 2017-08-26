import {Observable, PropertyChangeData} from "tns-core-modules/data/observable";
import {IExpense} from '~/models/expense'
import {getPersistor, IExpensePersistor} from "./persistor";
import {isNumber, isString} from "tns-core-modules/utils/types";
import {currentTime} from '~/utils/time'
import {ObservableArray} from "tns-core-modules/data/observable-array";
var dialogs = require("ui/dialogs");

let u = require('underscore');


export class AddExpenseModel extends Observable {

    private amount: number;
    private name: string;
    private tags: string = '';

    public parsed_tags;

    private _persistor: IExpensePersistor;

    constructor() {
        super();
        this._persistor = getPersistor();
        this.parsed_tags = new ObservableArray([]);
    }

    public onTagsTextFieldChange(ev) {
        console.log("Here");
        console.log(`${ev.propertyName} has changed. new val ${ev.value}`);
        const tag_string = ev.value;
        let that = this;

        u.forEach(u.range(this.parsed_tags.length), function (_) {
            that.parsed_tags.pop()
        });
        let parsed = this.parse_tags(tag_string);
        u.forEach(parsed, function (el) {
            that.parsed_tags.push(el);
        });

    }

    public createNewExpense() {
        try {
            this.validate();
        } catch (err) {
            panic(err.message);
            return;
        }


        //then create the expense
        let expense: IExpense = {
            id: null,
            amount: this.amount,
            name: this.name,
            timestamp_utc: currentTime(),
            tags: this.getParsedTags(),
        };

        //then persist it
        try {
            this._persistor.persistNew(expense);
        } catch (err) {
            alert(`Cannot persist the expense. ${err.message}`);
        }
    }

    private getParsedTags() {
        return u.map(this.parsed_tags, (el: string) => el)
    }

    private parse_tags(tag_string) {

        let arr = u.map(tag_string.split(','), (tag: string) => tag.trim().toLocaleLowerCase());

        arr = u.uniq(arr);
        arr = u.filter(arr, u.negate(u.isEmpty))

        return arr;
    }

    /**
     * Checks if the model has valid fields.
     * If an error is found an exceptions is raised.
     */
    private validate(): void {
        console.log(`isNumber= ${isNumber(this.amount)}`);
        console.log(`isNumber= ${this.amount} ${typeof this.amount}`);
        if (!isNumber(this.amount) || isNaN(this.amount)) {
            throw new Error(`You entered an invalid value for the amount field`);
        }

        if (this.name.length === 0) {
            throw new Error("The name of the expense cannot be empty.")
        }
    }
}
function panic(msg) {
    dialogs.alert({
        title: 'Invalid entry',
        message: msg,
        okButtonText: 'Ok'
    })
}