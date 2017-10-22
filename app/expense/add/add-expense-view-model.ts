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

    public parsed_tags: ObservableArray<string>;

    private _persistor: IExpensePersistor;

    constructor() {
        super();
        this._persistor = getPersistor();
        this.parsed_tags = new ObservableArray([]);
    }

    private clearAllTags() {
        this.parsed_tags.splice(0);
        // const that = this;
        // u.forEach(u.range(this.parsed_tags.length), function (_) {
        //     that.parsed_tags.pop()
        // });

    }

    public onTagsTextFieldChange(ev) {

        const tag_string = ev.value;
        const that = this;

        // can't change array while iterating it
        this.clearAllTags();

        let parsed = this.parse_tags(tag_string);
        // this.parsed_tags = new ObservableArray(parsed)
        u.forEach(parsed, function (el) {
            that.parsed_tags.push(el);
        });
    }

    public removeTag(tagToDelete: string) {

        let indexToRemove = null;
        this.parsed_tags.forEach((tag, index) => {
            if (tag === tagToDelete) {
                indexToRemove = index;
            }
        })
        if (isNumber(indexToRemove)) {
            console.log(`Len of array is ${this.parsed_tags.length}`);
            this.parsed_tags.splice(indexToRemove, indexToRemove + 1);
            console.log(`After deleting Len of array is ${this.parsed_tags.length}`);
        } else {
            console.error(`${tagToDelete} is not recognised as a tag,boom`)
        }

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
            id: null, // this will be set by the back-end
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
        arr = u.filter(arr, u.negate(u.isEmpty));

        return arr;
    }

    /**
     * Checks if the model has valid fields.
     * If an error is found an exceptions is raised.
     */
    private validate(): void {
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