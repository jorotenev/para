import {Observable} from "tns-core-modules/data/observable";
import {IExpense} from '../models/expense'
import {getPersistor, IExpensePersistor} from "./persistor";
import {isNumber} from "tns-core-modules/utils/types";
import {currentTime} from '../utils/time'
let u = require('underscore');


export class AddExpenseModel extends Observable {

    private amount: number;
    private name: string;
    private _persistor: IExpensePersistor;

    constructor() {
        super();
        this._persistor = getPersistor();
    }


    public createNewExpense() {

        this.validate();

        //then create the expense
        let expense: IExpense = {
            id: null,
            amount: this.amount,
            name: this.name,
            timestamp_utc: currentTime(), //TODO get the current time in ISO format;
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
        console.log(`isNumber= ${isNumber(this.amount)}`);
        console.log(`isNumber= ${this.amount} ${typeof this.amount}`);
        if (!isNumber(this.amount) || isNaN(this.amount)) {
            throw new Error(`${this.amount} is an invalid value for the amount field`)
        }
        if (this.name.length === 0) {
            throw new Error("The name of the expense cannot be empty.")
        }

    }
}