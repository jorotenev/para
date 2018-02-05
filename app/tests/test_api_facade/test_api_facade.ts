import {ExpenseDatabaseFacade, EXPENSES_API_ENDPOINT} from "~/api_facade/db_facade";
import {ten_expenses} from './sample_responses';
import {Expense, IExpense} from "~/models/expense";
import {firebase, http, ResponseError, Utils} from "~/api_facade/common";
import {DataStore} from "~/expense_datastore/datastore";
import {fakeHTTPResponse} from "~/tests/test_api_facade/test_http";


let u = require('underscore');

const promised_ten_results: Promise<IExpense[]> = Promise.resolve(ten_expenses);


export function testListExpenses(expenses: IExpense[], startFromId: number, batchSize: number) {
    expect(typeof expenses).toBe(typeof []);
    expect(expenses[0].id).toBe(startFromId);
    expect(expenses.length).toBe(batchSize);
}


function setUpBeforeEach(thisObject) {
    thisObject.mockedRequest = spyOn(Utils, 'makeRequest');
    thisObject.mockedRequest.and.callThrough();

    thisObject.mockedFirebase = spyOn(firebase, 'getAuthToken');
    thisObject.mockedFirebase.and.returnValue(Promise.resolve('some fake auth token'))
}

function setUpAfterEach(thisObject) {
    thisObject.mockedRequest.calls.reset();
    thisObject.mockedRequest.and.callThrough();

    thisObject.mockedFirebase.calls.reset();
    thisObject.mockedFirebase.and.callThrough();

}

describe("Testing the get_expenses_list() of  db facade", () => {

    beforeAll(function () {
        this.startFromId = 1;
        this.batchSize = 10;
        this.endpointURL = ExpenseDatabaseFacade.GETListEndpointTemplate({
            startFromId: this.startFromId,
            batchSize: this.batchSize
        });

        // sanity checking
        expect(this.endpointURL).toBe(`${EXPENSES_API_ENDPOINT}get_expenses_list?start_id=${this.startFromId}&batch_size=${this.batchSize}`);

    });

    beforeEach(function () {
        setUpBeforeEach(this)
    });
    afterEach(function () {
        setUpAfterEach(this)
    });

    it("api/get_expenses_list - requesting a list, returns a valid list", function (done) {
        const startFromId = this.startFromId;
        const batchSize = this.batchSize;
        // mock the API: set the return value of the mocked http.getJSON function
        this.mockedRequest.and.returnValue(promised_ten_results);

        // call the method that we actually test now
        let resultAsPromise: Promise<IExpense[]> = new ExpenseDatabaseFacade().get_list(startFromId, batchSize);
        expect(this.mockedRequest.calls.first().args).toEqual([this.endpointURL]);


        // the result of the tested method invocation is of correct shape
        expect(resultAsPromise && !!resultAsPromise.then && typeof resultAsPromise.then === 'function').toBe(true);

        resultAsPromise.then(function (payload) {
            testListExpenses(payload, startFromId, batchSize);
            done()
        }).catch(function (err: ResponseError) {
            fail(err.reason);
            done()
        })
    });

    it("api/get_expenses_list - when the server returns an error, the returned promise is rejected",
        function (done) {
            // pretend that calling the API resulted in an error
            let error: Promise<IExpense[]> = Promise.reject(new Error("Some expected testing error"));
            this.mockedRequest.and.returnValue(error);

            let resultAsPromise: Promise<IExpense[]> = new ExpenseDatabaseFacade().get_list(this.startFromId, this.batchSize);

            resultAsPromise.then(() => {
                fail("Promise should have been rejected.");
                done()
            }, (err: ResponseError) => {
                expect(err.reason.indexOf("Can't get expenses") !== -1).toBe(true);
                done()
            })
        });

});

describe("Testing the get_single() of the db facade", function () {
    beforeEach(function () {
        setUpBeforeEach(this);
        this.mockedRequest.and.returnValue(Promise.resolve(ten_expenses[0]));
    });
    afterEach(function () {
        setUpAfterEach(this)
    });


    it("method should return a promise", function () {
        let expensePromise = new ExpenseDatabaseFacade().get_single(1);

        expect(typeof expensePromise.then).toBe('function')
    });

    it("when the 'then' of the promise is called, it receives an Expense as a parameter",
        function (done) {
            new ExpenseDatabaseFacade().get_single(1).then(function (data: IExpense) {
                    const expectedKeys = ["id", "timestamp_utc", "amount", "currency", "name", "tags"];

                    let responseKeys = Object.keys(data);
                    expect(u.intersection(expectedKeys, responseKeys)).toEqual(expectedKeys);
                    done()
                },
                function () {
                    fail("Rejected called on a promise, but expected resolved to be called");
                    done();
                })
        });
    it("the promise which get_single returns is rejected if the server doesn't return correctly",
        function (done) {
            this.mockedRequest.and.returnValue(Promise.reject(""));

            new ExpenseDatabaseFacade().get_single(1).then(function () {
                fail();
                done()
            }, function (err: ResponseError) {

                expect(err.reason.indexOf("Cannot find expense with id 1") !== -1).toBe(true);
                done()
            })
        })
});

describe('Testing the persist() of the db facade', function () {
    beforeEach(function () {
        setUpBeforeEach(this);
        this.mockedRequest.and.returnValue(Promise.resolve(ten_expenses[0]));
    });
    afterEach(function () {
        setUpAfterEach(this)
    });
    it("persist() resovles if the server returns a valid expense", function (done) {
        let unsaved = {...ten_expenses[0], id: null};
        this.mockedRequest.and.returnValue(Promise.resolve(ten_expenses[0]));

        new ExpenseDatabaseFacade().persist(unsaved).then(persisted => {
            expect(ten_expenses[0]).toEqual(persisted);
            done()
        }, fail)
    });
    it("persist() rejects if the server returns a persisted expense with a null id", function (done) {
        let badResponse = {...ten_expenses[0], id: null};
        this.mockedRequest.and.returnValue(Promise.resolve(badResponse));
        new ExpenseDatabaseFacade().persist(Expense.createEmptyExpense()).then(fail, err => {
            expect(err.reason.indexOf('Server returned an expense with a null id after persisting') !== -1).toBe(true);
            done()
        })
    })
    it("persist() rejects if an expense with a non-null id is passed", function (done) {
        let expWithId = ten_expenses[0]
        new ExpenseDatabaseFacade().persist(expWithId).then(fail, (err) => {
            expect(err.reason.indexOf("with an id") !== -1).toBe(true)
            done()
        })
    })
});

describe("Testing the update() of the db facade", function () {
    beforeEach(function () {
        setUpBeforeEach(this);
        this.mockedRequest.and.returnValue(Promise.resolve(ten_expenses[0]));
    });
    afterEach(function () {
        setUpAfterEach(this)
    });
    it("resolves with the expense that was received from makeRequest", function (done) {
        this.mockedRequest.and.returnValue(Promise.resolve(ten_expenses[0]));
        new ExpenseDatabaseFacade().update(ten_expenses[0]).then(updated => {
            expect(updated).toEqual(ten_expenses[0]);
            done()
        })
    });
    it("can't update an expense which doesn't have an id", function (done) {
        let nonIDExpense = Expense.createEmptyExpense();
        new ExpenseDatabaseFacade().update(nonIDExpense).then(fail, err => {
            expect(err.reason.indexOf("doesn't have an ID") !== -1).toBe(true);
            done()
        })
    })
});

describe('Testing the remove() of the db facade', function () {
    beforeEach(function () {
        setUpBeforeEach(this);
        this.mockedRemove = spyOn(DataStore.prototype, 'remove');
        this.mockedHTTP = spyOn(http, 'request');
        this.mockedHTTP.and.callThrough();

    });

    afterEach(function () {
        setUpAfterEach(this);

        this.mockedRemove.calls.reset();
        this.mockedRemove.and.callThrough();

        this.mockedHTTP.calls.reset();
        this.mockedHTTP.and.callThrough();
    });

    it("trying to delete an expense without an id rejects", function (done) {
        let exp = Expense.createEmptyExpense();
        new ExpenseDatabaseFacade().remove(exp).then(fail, err => {
            expect(err.reason.indexOf("Can't delete an expense without an id") !== -1).toBe(true);
            done()
        })
    });

    it("resolves with true on API 200", function (done) {

        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("{\"asd\":1}", 200)));

        new ExpenseDatabaseFacade().remove(ten_expenses[0]).then(done, fail)
    });

    it("rejects when the API returns 404 with a reason", function (done) {

        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("{\"error\":\"some reason\"}", 404)));
        new ExpenseDatabaseFacade().remove(ten_expenses[0]).then(fail, err => {
            expect(err.reason.indexOf("some reason") !== -1).toBe(true);
            done()
        })

    });
});

