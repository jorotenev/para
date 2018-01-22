import {Observable, PropertyChangeData} from "tns-core-modules/data/observable";
import {IExpense, Expense, ExpenseAmount} from '~/models/expense'
import {isNumber} from "tns-core-modules/utils/types";
import {currentTimeUTC} from '~/utils/time'
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {ExpenseDatabaseFacade, IExpenseDatabaseFacade} from "~/expense/db_facade/facade";

let dialogs = require("ui/dialogs");
let u = require('underscore');


export class AddExpenseModel extends Observable {

    public tagsHandler: ITagsHandler = new TagsHandler();

    private amount: number;
    private name: string;


    private _dbFacade: IExpenseDatabaseFacade;

    constructor() {
        super();
        this._dbFacade = new ExpenseDatabaseFacade();
    }

    public createNewExpense(): Promise<IExpense> {
        try {
            this.validate();
        } catch (err) {
            panic(err.message);
            return Promise.reject(new Error(err.message))
        }

        //then create the expense
        let expenseData: IExpense = {
            id: null,
            amount: {'raw_amount': this.amount, 'currency': 'EUR'},
            name: this.name,
            timestamp_utc: currentTimeUTC(),
            tags: this.tagsHandler.tags,
        };

        //then persist it
        return this._dbFacade.persist(expenseData);

    }

    /**
     * Checks if the model has valid fields.
     * If an error is found an exceptions is raised.
     */
    private validate(): void {
        if (!isNumber(this.amount) || isNaN(this.amount)) {
            throw new Error(`You entered an invalid value for the amount field`);
        }

        if (!this.name || this.name.length === 0) {
            throw new Error("The name of the expense cannot be empty.")
        }
    }
}

export interface ITagsHandler {

    tags: string[];

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

    public tagNamesObservable: ObservableArray<string> = new ObservableArray([]);

    public get tags(): string[] {
        return this.tagNamesObservable.map((e: string) => e)
    }

    public add(tag_name: string): boolean {
        console.log('adding tag ', tag_name);
        if (this.tagNamesObservable.indexOf(tag_name) !== -1) {
            return false;
        }
        if (tag_name.length === 0) {
            return false;
        }
        this.tagNamesObservable.push(tag_name);

        return true;
    }

    public delete(tag_name: string): boolean {
        console.log('removing tag ', tag_name);
        let index = this.tagNamesObservable.indexOf(tag_name);
        if (index === -1) {
            console.error(`${tag_name} is not in the managed tags`);
            return false;
        }

        this.tagNamesObservable.splice(index, index + 1);
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