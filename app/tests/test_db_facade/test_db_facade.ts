import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {ten_expenses} from './sample_responses';
import {http} from "~/expense/db_facade/facade"
import {IExpense} from "~/models/expense";
import {apiAddress} from "~/app_config";

var u = require('underscore');
var mocker = require('ts-mockito');

const promised_ten_results: Promise<IExpense[]> = new Promise(function (resolve, _) {
    resolve(ten_expenses)
});

export function test_list_expenses(expenses: IExpense[], startFromId: number, batchSize: number) {
    expect(typeof expenses).toBe(typeof []);
    expect(expenses[0].id).toBe(startFromId);
    expect(expenses.length).toBe(batchSize);
}
// A sample Jasmine test
describe("Testing the get_expenses_list of  db facade", async () => {

    beforeAll(function() {
        this.startFromId = 1;
        this.batchSize = 10;
        this.endpointURL = ExpenseDatabaseFacade.GETListEndpointTemplate({
            startFromId: this.startFromId,
            batchSize: this.batchSize
        });
        // sanity checking

        expect(this.endpointURL).toBe(`${apiAddress}get_expenses_list/${this.startFromId}?batch_size=${this.batchSize}`);
        spyOn(http, 'getJSON');
        this.mockedGetJSON = <any> http.getJSON;
    });

    beforeEach(function () {
        this.mockedGetJSON.calls.reset();
    });

    it("api/get_expenses_list - Getting a list of expenses", async function () {

        // mock the API: set the return value of the mocked http.getJSON function
        this.mockedGetJSON.and.returnValue(promised_ten_results);

        // call the method that we actually test now
        let resultAsPromise: Promise<IExpense[]> = new ExpenseDatabaseFacade().get_list(this.startFromId, this.batchSize);

        // check facade.get_list() has called getJSON with the correct url
        expect(this.mockedGetJSON.calls.first().args).toEqual([this.endpointURL]);

        // the result of the tested method invocation is of correct shape
        expect(resultAsPromise && !!resultAsPromise.then && typeof resultAsPromise.then === 'function').toBe(true);

        // unbox the result
        let settled_result: IExpense[] = await resultAsPromise;

        test_list_expenses(settled_result, this.startFromId, this.batchSize);
    });

    it("api/get_expenses_list - when the server returns an error", async function () {
        // pretend that calling the API resulted in an error
        let error: Promise<IExpense[]> = new Promise((resolve, reject) => {
            reject(new Error("Some error"));
        });

        this.mockedGetJSON.and.returnValue(error);

        let resultAsPromise : Promise<IExpense[]>  = new ExpenseDatabaseFacade().get_list(this.startFromId, this.batchSize)
        resultAsPromise.then(()=>{
            fail("Promise should have been rejected.")
        }, (err: Error)=>{
            expect(err.message).toContain("Can't get expenses");
        })
    });
});
