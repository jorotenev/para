import {ExpenseDatabaseFacade, EXPENSES_API_ENDPOINT, makeRequest} from "~/expense/db_facade/facade";
import {ten_expenses} from './sample_responses';
import {http} from "~/expense/db_facade/facade"
import {Expense, IExpense} from "~/models/expense";
import {apiAddress} from "~/app_config";


var u = require('underscore');

const promised_ten_results: Promise<IExpense[]> = Promise.resolve(ten_expenses);

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
        spyOn(http, 'request');
        this.mockedGetJSON = <any> http.request;
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
            reject(new Error("Some expected testing error"));
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

describe("Testing the get_single of the db facade", function () {

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

        expect(typeof expensePromise.then).toBe('function')
    });

    it("when the 'then' of the promise is called, it receives an Expense as a parameter", function (done) {
        new ExpenseDatabaseFacade().get_single(1).then(function (data: IExpense) {
                const expectedKeys = ["id", "timestamp_utc", "amount", "name", "tags"];
                let responseKeys = Object.keys(data);
                expect(u.intersection(expectedKeys, responseKeys)).toEqual(expectedKeys);
                done()
            },
            function () {
                fail("Rejected called on a promise, but expected resolved to be called");
                done();
            })
    });
    it("the promise which get_single returns is rejected if the server doesn't return correctly", function (done) {
        this.mockedGetJSON.and.returnValue(new Promise(function (resolve, reject) {
            reject()
        }));

        new ExpenseDatabaseFacade().get_single(1).then(function () {
            fail();
            done()
        }, function (err) {
            expect(err.indexOf("Cannot find expense with id 1") !== -1).toBe(true)
            done()
        })
    })
});

function fakeHTTPResponse(raw, statusCode) {
    return {
        "content": {
            "raw": "",
            "toJSON": () => {
                return JSON.parse(raw)
            },
            "toFile": () => {
            },
            "toSting": () => {
            },
            "toImage": () => {
            }
        },
        "statusCode": statusCode,
        "headers": []

    }
}

describe("Test of the API facade makeRequest", function () {
    beforeAll(function () {
        spyOn(http, 'request');
        this.mockedRequest = <any> http.request;
    });
    beforeEach(function () {
        this.mockedRequest.calls.reset();
        this.mockedRequest.and.callThrough();
    });

    it("returning a 500 leads to a rejection", function (done) {
        this.mockedRequest.and.returnValue(Promise.resolve(fakeHTTPResponse("", 500)));


        makeRequest("http://wonderland:5000/api/test-500").then(function () {
            fail("Promise should have been rejected.");
            done()
        }, function (error) {
            expect(error.indexOf("Status code is 500") !== -1).toBe(true);
            done();

        });
    });

    fit("returning a 200 leads resolving the promise and parsing the json", function (done) {
        this.mockedRequest.and.returnValue(Promise.resolve(fakeHTTPResponse('{"content":"rebra"}', 200)));

        makeRequest("http://wonderland:5000/api/test-200").then(function (json)  {
            expect(json.content).toBe("rebra");
            done();
        }, function(err){
            fail(err);
            done()
        })
    })
})
