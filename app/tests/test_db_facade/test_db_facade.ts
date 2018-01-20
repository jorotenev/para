import {ExpenseDatabaseFacade, EXPENSES_API_ENDPOINT} from "~/expense/db_facade/facade";
import {ten_expenses} from './sample_responses';
import {http} from "~/expense/db_facade/facade"
import {Expense, IExpense} from "~/models/expense";
import {apiAddress} from "~/app_config";
import {instance} from "ts-mockito";

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

    beforeAll(function () {
        this.startFromId = 1;
        this.batchSize = 10;
        this.endpointURL = ExpenseDatabaseFacade.GETListEndpointTemplate({
            startFromId: this.startFromId,
            batchSize: this.batchSize
        });
        // sanity checking

        expect(this.endpointURL).toBe(`${EXPENSES_API_ENDPOINT}get_expenses_list?start_id=${this.startFromId}&batch_size=${this.batchSize}`);
        spyOn(http, 'getJSON');
        this.mockedGetJSON = <any> http.getJSON;
    });

    beforeEach(function () {
        this.mockedGetJSON.calls.reset();
        this.mockedGetJSON.and.callThrough();
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
        let resultAsPromise: Promise<IExpense[]> = new ExpenseDatabaseFacade().get_list(this.startFromId, this.batchSize)
        resultAsPromise.then(() => {
            fail("Promise should have been rejected.")
        }, (err: Error) => {
            expect(err.message).toContain("Can't get expenses");
        })
    });

});

fdescribe("Testing the get_single of the db facade", function () {

    beforeAll(function () {

        spyOn(http, 'getJSON');
        this.mockedGetJSON = <any> http.getJSON;
    });

    beforeEach(function () {
        this.mockedGetJSON.calls.reset();
        this.mockedGetJSON.and.callThrough();

        this.mockedGetJSON.and.returnValue(new Promise(function (resolve, reject) {
            resolve(ten_expenses[0])
        }));
    });

    it("method should return a promise", function () {
        let expensePromise = new ExpenseDatabaseFacade().get_single(1);
        expect(!!expensePromise && expensePromise.hasOwnProperty('then')).toBe(true)
    });

    it("when the 'then' of the promise is called, it receives an Expense as a parameter", function (done) {
        new ExpenseDatabaseFacade().get_single(1).then(function (data: IExpense) {
                const expectedKeys: string[] = ["id", "timestamp_utc", "amount", "name", "tags"];
                const templateObject: IExpense = {
                    "id": 1,
                    "timestamp_utc": "",
                    "amount": {"raw_amount": 1, 'currency': ''},
                    "name": "",
                    "tags": []

                };
                expect(data).toEqual(templateObject);
                done()

            },
            function () {
                fail();
                done();
            })
    })
    it("the promise which get_single returns is rejected if the server doesn't return correctly", function (done) {
        this.mockedJSON.and.returnValue(new Promise(function (resolve, reject) {
            reject()
        }));

        new ExpenseDatabaseFacade().get_single(1).then(function () {
            fail()
            done()
        }, function (err) {
            expect(err.indexOf("Cannot find expense with id 1") !== -1).toBe(true)
            done()
        })
    })
});
