import {ExpenseDatabaseFacade} from "~/api_facade/db_facade";
import {SINGLE_EXPENSE, ten_expenses} from './sample_responses';
import {Expense, IExpense} from "~/models/expense";
import {firebase, http, ResponseError, Utils} from "~/api_facade/common";
import {fakeHTTPResponse} from "~/tests/test_api_facade/test_http";
import {HttpRequestOptions} from "tns-core-modules/http";
import {GetListOpts, Order, SyncRequest, SyncResponse} from "~/api_facade/types";
import {currentTimeLocal, localTimeToUtc, timeOperations} from "~/utils/time";
import * as moment from "moment"

const promised_ten_results: Promise<IExpense[]> = Promise.resolve(ten_expenses);
const newest_expense = Object.freeze(ten_expenses[ten_expenses.length - 1]);

export function testListExpenses(expenses: IExpense[], startFrom: IExpense, batchSize: number) {
    expect(typeof expenses).toBe(typeof []);
    expenses.forEach((exp) => {

        let validateFunc = () => Expense.validate_throw({...exp}); // copy just the `properties` of the expense
        expect(validateFunc).not.toThrow()
    });

    expect(expenses.length).toBe(batchSize);
}

export function mockFirebaseBeforeEach() {
    this.mockedFirebase = spyOn(firebase, 'getAuthToken');
    this.mockedFirebase.and.returnValue(Promise.resolve('some fake auth token'))
}

export function mockFirebaseAfterEach() {
    this.mockedFirebase.calls.reset();
    this.mockedFirebase.and.callThrough();
}

function setUpBeforeEach() {
    this.mockedRequest = spyOn(Utils, 'makeRequest');
    this.mockedRequest.and.callThrough();

    mockFirebaseBeforeEach.call(this)
}

function setUpAfterEach() {
    this.mockedRequest.calls.reset();
    this.mockedRequest.and.callThrough();
    mockFirebaseAfterEach.call(this)
}

/**
 *
 * @param mocked the mocked method
 * @param forCall passed to the calls.argsFor of the mock
 * @return {any}
 */
function getHttpOptsOfMockHTTPCall(mocked, forCall: number = 0) {

    return mocked.calls.argsFor(forCall)[0]
}

describe("Testing the get_expenses_list() of the API facade", () => {

    beforeAll(function () {
        this.batch_size = 9;
        this.endpointURLTemplate = ExpenseDatabaseFacade.GETListEndpointTemplate;
    });

    beforeEach(function () {
        setUpBeforeEach.call(this)
    });

    afterEach(function () {
        setUpAfterEach.call(this)
    });

    it("api/get_expenses_list - requesting a list, returns a valid list", function (done) {
        const startFrom: IExpense = <IExpense> newest_expense;
        let two_expenses = [ten_expenses[0], ten_expenses[1]];
        this.mockedRequest.and.returnValue(Promise.resolve(two_expenses));
        let request_opts: GetListOpts = {
            start_from: startFrom,
            batch_size: this.batch_size
        };
        let resultAsPromise: Promise<IExpense[]> = new ExpenseDatabaseFacade().get_list(request_opts);
        expect(this.mockedRequest).toHaveBeenCalledWith(this.endpointURLTemplate({
            start_from_id: startFrom.id,
            start_from_property: 'timestamp_utc',
            start_from_property_value: startFrom.timestamp_utc,
            batchSize: this.batchSize,
            order_direction: Order.desc
        }));


        // the result of the tested method invocation is of correct shape
        expect(resultAsPromise && !!resultAsPromise.then && typeof resultAsPromise.then === 'function').toBe(true);

        let response_size = two_expenses.length;
        resultAsPromise.then(function (payload) {
            testListExpenses(payload, startFrom, response_size);
            //todo more tests here
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
            let request_opts: GetListOpts = {
                start_from: newest_expense,
                batch_size: this.batch_size
            };
            let resultAsPromise: Promise<IExpense[]> = new ExpenseDatabaseFacade().get_list(request_opts);

            resultAsPromise.then(() => {
                fail("Promise should have been rejected.");
                done()
            }, (err: ResponseError) => {
                expect(err.reason.indexOf("Can't get expenses") !== -1).toBe(true);
                done()
            })
        });

});


describe('Testing the persist() of the API facade', function () {
    beforeEach(function () {
        setUpBeforeEach.call(this);
        this.mockedRequest.and.returnValue(Promise.resolve(SINGLE_EXPENSE));
    });
    afterEach(function () {
        setUpAfterEach.call(this)
    });
    it("persist() resovles if the server returns a valid expense", function (done) {
        let unsaved = {...SINGLE_EXPENSE, id: null};
        this.mockedRequest.and.returnValue(Promise.resolve(SINGLE_EXPENSE));

        new ExpenseDatabaseFacade().persist(unsaved).then(persisted => {
            expect(SINGLE_EXPENSE).toEqual(persisted);
            done()
        }, fail)
    });

    it("persist() rejects if the server returns a persisted expense with a null id", function (done) {
        let badResponse = {...SINGLE_EXPENSE, id: null};
        this.mockedRequest.and.returnValue(Promise.resolve(badResponse));
        new ExpenseDatabaseFacade().persist({...SINGLE_EXPENSE, id: null}).then(fail, err => {
            console.dir(err)
            expect(err.reason.indexOf('Server returned an expense with a null id after persisting') !== -1).toBe(true);
            done()
        })
    });

    it("persist() rejects if an expense with a non-null id is passed", function (done) {
        let expWithId = {...SINGLE_EXPENSE}
        new ExpenseDatabaseFacade().persist(expWithId).then(fail, (err) => {
            expect(err.reason.indexOf("with an id") !== -1).toBe(true)
            done()
        })
    })
});

describe("Testing the update() of the API facade", function () {
    beforeEach(function () {
        setUpBeforeEach.call(this);
        this.mockedRequest.and.returnValue(Promise.resolve(SINGLE_EXPENSE));
    });
    afterEach(function () {
        setUpAfterEach.call(this)
    });
    it("resolves with the expense that was received from makeRequest", function (done) {
        let expense = {...SINGLE_EXPENSE};
        let updated: IExpense = {...expense}; // the server updates the ts_updated
        this.mockedRequest.and.returnValue(Promise.resolve(updated));
        new ExpenseDatabaseFacade().update(expense, expense).then(exp => {
            expect(exp).toEqual(updated);
            done()
        }, fail)
    });
    it("can't update an expense which doesn't have an id", function (done) {
        let nonIDExpense = {...SINGLE_EXPENSE, id: null};
        new ExpenseDatabaseFacade().update(nonIDExpense, {...SINGLE_EXPENSE}).then(fail, err => {
            expect(err.reason.indexOf("doesn't have an ID") !== -1).toBe(true);
            done()
        })
    });
    it('fails if the old expense is invalid', function (done) {
        let newExpense = {...SINGLE_EXPENSE};
        let oldInvalidExpense = {...SINGLE_EXPENSE, timestamp_utc: ''};

        new ExpenseDatabaseFacade().update(newExpense, oldInvalidExpense).then(fail, err => {
            expect(err.reason.indexOf("not a valid expense") !== -1).toBe(true);
            done()
        })
    });
    it("fails if the old expense doesn't have an id", function (done) {

        let oldInvalidExpense = {...SINGLE_EXPENSE, id: null};
        new ExpenseDatabaseFacade().update(SINGLE_EXPENSE, oldInvalidExpense).then(fail, err => {
            expect(err.reason.indexOf("doesn't have an ID") !== -1).toBe(true);
            done()
        })
    });
    it('fails if the makeRequest rejects', function (done) {
        this.mockedRequest.and.returnValue(Promise.reject(<ResponseError>{reason: "musaka"}));
        new ExpenseDatabaseFacade().update(SINGLE_EXPENSE, SINGLE_EXPENSE).then(fail, err => {
            expect(err.reason.indexOf("musaka") !== -1).toBe(true);
            done()
        })
    });
});

describe('Testing the remove() of the API facade', function () {
    beforeEach(function () {
        setUpBeforeEach.call(this);
        this.mockedRemove = spyOn(ExpenseDatabaseFacade.prototype, 'remove');
        this.mockedHTTP = spyOn(http, 'request');
        this.mockedRemove.and.callThrough();
        this.mockedHTTP.and.callThrough();

    });

    afterEach(function () {
        setUpAfterEach.call(this);

        this.mockedRemove.calls.reset();
        this.mockedRemove.and.callThrough();

        this.mockedHTTP.calls.reset();
        this.mockedHTTP.and.callThrough();
    });

    it("trying to delete an expense without an id rejects", function (done) {
        let exp = {...SINGLE_EXPENSE, id: null};
        new ExpenseDatabaseFacade().remove(exp).then(fail, err => {
            expect(err.reason.indexOf("Can't delete an expense without an id") !== -1).toBe(true);
            done()
        })
    });

    it("resolves with true on API 200", function (done) {

        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("{\"asd\":1}", 200)));


        let expense = {...SINGLE_EXPENSE};
        new ExpenseDatabaseFacade().remove(expense).then(done, fail)
    });

    it("rejects when the API returns 404 with a reason", function (done) {
        let expense = {...SINGLE_EXPENSE};

        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("{\"error\":\"some reason\"}", 404)));
        new ExpenseDatabaseFacade().remove(expense).then(fail, err => {
            expect(err.reason.indexOf("some reason") !== -1).toBe(true);
            done()
        })

    });
});

describe("test the sync() method of the API facade", function () {
    beforeAll(function () {
        this.request = <SyncRequest>  [
            ten_expenses[0],
            ten_expenses[1]
        ];

    });

    beforeEach(function () {
        setUpBeforeEach.call(this);
        this.mockedSync = spyOn(ExpenseDatabaseFacade.prototype, 'sync');
        this.mockedHTTP = spyOn(http, 'request');

        this.mockedHTTP.and.callThrough();
        this.mockedSync.and.callThrough();

    });

    afterEach(function () {
        setUpAfterEach.call(this);

        this.mockedSync.calls.reset();
        this.mockedSync.and.callThrough();

        this.mockedHTTP.calls.reset();
        this.mockedHTTP.and.callThrough();
    });

    it("returns a valid SyncResponse", function (done) {
        let expense_a = ten_expenses[0];
        let expense_b = ten_expenses[1];
        let expense_c = ten_expenses[2];
        let httpResult = <SyncResponse>{
            "to_add": [expense_a],
            "to_remove": [expense_b.id],
            "to_update": [expense_c]
        };

        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse(JSON.stringify(httpResult), 200)));

        new ExpenseDatabaseFacade().sync(this.request).then((result: SyncResponse) => {
            expect(result.to_add).toEqual([expense_a]);
            expect(result.to_remove).toEqual([expense_b.id]);
            expect(result.to_update).toEqual([expense_c]);

            expect(this.mockedHTTP).toHaveBeenCalledTimes(1);
            let httpOpts: HttpRequestOptions = getHttpOptsOfMockHTTPCall(this.mockedHTTP); //options arg of first call
            let expectedRequest = {
                [this.request[0].id]: {
                    'timestamp_utc': this.request[0].timestamp_utc,
                    'timestamp_utc_updated': this.request[0].timestamp_utc_updated
                },
                [this.request[1].id]: {
                    'timestamp_utc': this.request[1].timestamp_utc,
                    'timestamp_utc_updated': this.request[1].timestamp_utc_updated
                },
            };
            expect(httpOpts.content).toBe(JSON.stringify(expectedRequest));

            done()
        }, fail)
    });

    it("rejects if the server didn't return a proper SyncResponse", function (done) {
        let httpResult = {
            "to_add": [ten_expenses[2]]
        };

        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse(JSON.stringify(httpResult), 200)));
        new ExpenseDatabaseFacade().sync(this.request).then(fail, done)
    });

    it("it's not valid for items/ids to appear in multiple sections of the response",
        function (done) {
            const response: SyncResponse = {
                to_remove: [SINGLE_EXPENSE.id],
                to_add: [SINGLE_EXPENSE],
                to_update: []
            };

            this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse(JSON.stringify(response), 200)));
            console.dir(this.mockedHTTP);

            let facade = new ExpenseDatabaseFacade();
            let promise = facade.sync(this.request);

            promise.then(fail, err => {
                expect(err.reason.indexOf("id appears in more than one section of the response") !== -1).toBe(true)
                done()
            })
        })

});

describe("test the get_statistics methods of the API facade", function () {
    let fromLocal = timeOperations({baseTime: currentTimeLocal(), action: "subtract", modifier: "weeks", amount: 1});
    let toLocal = currentTimeLocal();
    let dummyResponse = {
        "EUR": 100,
        "BGN": 50
    };
    beforeEach(function () {
        setUpBeforeEach.call(this);
    });

    afterEach(function () {
        setUpAfterEach.call(this);
    });

    it("method resolves with the value of the makeRequest()", function (done) {

        this.mockedRequest.and.returnValue(Promise.resolve(dummyResponse));
        new ExpenseDatabaseFacade().get_statistics({to_dt_local: toLocal, from_dt_local: fromLocal}).then(
            result => {
                expect(result['EUR']).toBe(100);
                expect(result['BGN']).toBe(50);
                done()
            },
            fail
        );
    });
    it("method converts the timestamps to utc when making the request", function (done) {
        this.mockedRequest.and.returnValue(Promise.resolve(dummyResponse));

        new ExpenseDatabaseFacade().get_statistics({to_dt_local: toLocal, from_dt_local: fromLocal}).then(_ => {
            let url = this.mockedRequest.calls.argsFor(0)[0];
            let splitted = url.split('/').reverse();
            let to_dt_utc = splitted[0];
            let from_dt_utc = splitted[1];
            expect(from_dt_utc).toBe(localTimeToUtc(fromLocal));
            expect(to_dt_utc).toBe(localTimeToUtc(toLocal));
            done();
        }, fail)
    });

    it("fails immediately if to < from", function (done) {
        let shouldBoom = () => new ExpenseDatabaseFacade().get_statistics({
            from_dt_local: toLocal,
            to_dt_local: fromLocal
        });
        expect(shouldBoom).toThrowError("Invalid time boundaries");
        done()
    });
});