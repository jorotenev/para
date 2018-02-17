import {ExpenseDatabaseFacade, GetListOpts, Order, SyncRequest, SyncResponse} from "~/api_facade/db_facade";
import {SINGLE_EXPENSE, ten_expenses} from './sample_responses';
import {Expense, ExpenseConstructor, IExpense} from "~/models/expense";
import {firebase, http, ResponseError, Utils} from "~/api_facade/common";
import {fakeHTTPResponse} from "~/tests/test_api_facade/test_http";


let u = require('underscore');

const promised_ten_results: Promise<ExpenseConstructor[]> = Promise.resolve(ten_expenses);
const newest_expense = Object.freeze(ten_expenses[ten_expenses.length - 1])

export function testListExpenses(expenses: IExpense[], startFrom: IExpense, batchSize: number) {
    expect(typeof expenses).toBe(typeof []);
    expenses.forEach((exp) => {
        let validateFunc = () => Expense.validate(exp)
        expect(validateFunc).not.toThrow()
    })

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

describe("Testing the get_expenses_list() of  db facade", () => {

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
                start_from: new Expense(newest_expense),
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


describe('Testing the persist() of the db facade', function () {
    beforeEach(function () {
        setUpBeforeEach.call(this);
        this.mockedRequest.and.returnValue(Promise.resolve(SINGLE_EXPENSE));
    });
    afterEach(function () {
        setUpAfterEach.call(this)
    });
    it("persist() resovles if the server returns a valid expense", function (done) {
        let unsaved = new Expense({...SINGLE_EXPENSE, id: null});
        this.mockedRequest.and.returnValue(Promise.resolve(SINGLE_EXPENSE));

        new ExpenseDatabaseFacade().persist(unsaved).then(persisted => {
            expect(SINGLE_EXPENSE).toEqual(persisted);
            done()
        }, fail)
    });

    it("persist() rejects if the server returns a persisted expense with a null id", function (done) {
        let badResponse = {...SINGLE_EXPENSE, id: null};
        this.mockedRequest.and.returnValue(Promise.resolve(badResponse));
        new ExpenseDatabaseFacade().persist(Expense.createEmptyExpense()).then(fail, err => {
            expect(err.reason.indexOf('Server returned an expense with a null id after persisting') !== -1).toBe(true);
            done()
        })
    });

    it("persist() rejects if an expense with a non-null id is passed", function (done) {
        let expWithId = new Expense(SINGLE_EXPENSE)
        new ExpenseDatabaseFacade().persist(expWithId).then(fail, (err) => {
            expect(err.reason.indexOf("with an id") !== -1).toBe(true)
            done()
        })
    })
});

describe("Testing the update() of the db facade", function () {
    beforeEach(function () {
        setUpBeforeEach.call(this);
        this.mockedRequest.and.returnValue(Promise.resolve(SINGLE_EXPENSE));
    });
    afterEach(function () {
        setUpAfterEach.call(this)
    });
    it("resolves with the expense that was received from makeRequest", function (done) {
        let expense = new Expense(SINGLE_EXPENSE)
        this.mockedRequest.and.returnValue(Promise.resolve(expense));
        new ExpenseDatabaseFacade().update(expense).then(updated => {
            expect(updated).toEqual(expense);
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
        let exp = Expense.createEmptyExpense();
        new ExpenseDatabaseFacade().remove(exp).then(fail, err => {
            expect(err.reason.indexOf("Can't delete an expense without an id") !== -1).toBe(true);
            done()
        })
    });

    it("resolves with true on API 200", function (done) {

        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("{\"asd\":1}", 200)));


        let expense = new Expense(SINGLE_EXPENSE);
        new ExpenseDatabaseFacade().remove(expense).then(done, fail)
    });

    it("rejects when the API returns 404 with a reason", function (done) {
        let expense = new Expense(SINGLE_EXPENSE);

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
            {
                id: 1,
                timestamp_utc_updated: ''
            },
            {
                id: 2,
                timestamp_utc_updated: ''
            }
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
            }
        ;
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse(JSON.stringify(httpResult), 200)));

        new ExpenseDatabaseFacade().sync(this.request).then((result: SyncResponse) => {
            expect(result.to_add).toEqual([expense_a]);
            expect(result.to_remove).toEqual([expense_b.id]);
            expect(result.to_update).toEqual([expense_c]);
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