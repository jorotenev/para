import {Observable, PropertyChangeData} from "tns-core-modules/data/observable";
import {IExpense} from '~/models/expense'
import {getPersistor, IExpensePersistor} from "./persistor";
import {isNumber, isString} from "tns-core-modules/utils/types";
import {currentTime} from '~/utils/time'
import {ObservableArray} from "tns-core-modules/data/observable-array";
var dialogs = require("ui/dialogs");

let u = require('underscore');


export class AddExpenseModel extends Observable {

    public tagsHandler: ITagsHandler = new TagsHandler();

    private amount: number;
    private name: string;

    private _persistor: IExpensePersistor;

    constructor() {
        super();
        this._persistor = getPersistor();

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
            tags: this.tagsHandler.tag_names,
        };

        //then persist it
        try {
            this._persistor.persistNew(expense);
        } catch (err) {
            alert(`Cannot persist the expense. ${err.message}`);
        }
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

export interface ITagsHandler {

    tag_names: ObservableArray<string>;

    /**
     * adds a new tag. returns false if a tag with the same name is already managed by the handler
     * @param tag_name:string - the name of the tag
     * :returns boolean
     */
    add(tag_name: string): boolean;

    /**
     * Removes the tag. returns false if attempting to delete a tag which's not managed by this handler.
     * @param tag_name
     * :returns boolean
     */
    delete(tag_name: string): boolean;
}

class TagsHandler implements ITagsHandler {
    tag_names: ObservableArray<string> = new ObservableArray([]);

    add(tag_name: string): boolean {
        console.log('adding tag ', tag_name);
        if (this.tag_names.indexOf(tag_name) !== -1) {
            return false;
        }
        if (tag_name.length === 0) {
            return false;
        }
        this.tag_names.push(tag_name)

        return true;
    }

    delete(tag_name: string): boolean {
        console.log('removing tag ', tag_name);
        let index = this.tag_names.indexOf(tag_name);
        if (index === -1) {
            console.error(`${tag_name} is not in the managed tags`);
            return false;
        }

        this.tag_names.splice(index, index + 1);
        return true;
    }
}

function panic(msg) {
    dialogs.alert({
        title: 'Invalid entry',
        message: msg,
        okButtonText: 'Ok'
    })
}