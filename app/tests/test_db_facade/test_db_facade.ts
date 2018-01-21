import {ExpenseDatabaseFacade, EXPENSES_API_ENDPOINT, ResponseError, Utils} from "~/expense/db_facade/facade";
import {ten_expenses} from './sample_responses';
import {http} from "~/expense/db_facade/facade"
import {IExpense} from "~/models/expense";
import {HttpResponse} from "tns-core-modules/http";

var u = require('underscore');

const promised_ten_results: Promise<IExpense[]> = Promise.resolve(ten_expenses);


export function testListExpenses(expenses: IExpense[], startFromId: number, batchSize: number) {
    expect(typeof expenses).toBe(typeof []);
    expect(expenses[0].id).toBe(startFromId);
    expect(expenses.length).toBe(batchSize);
}

function fakeHTTPResponse(raw, statusCode): HttpResponse {
    return {
        "content": {
            "raw": raw,
            "toJSON": () => {
                return JSON.parse(raw)
            },
            "toFile": () => {
                return null
            },
            "toString": () => {
                return ""
            }
            ,
            "toImage": () => {
                return null
            }
        },
        "statusCode": statusCode,
        "headers": null

    }
}

function setUpBeforeEach(thisObject) {
    thisObject.mockedRequest = spyOn(Utils, 'makeRequest')
}

function setUpAfterEach(thisObject) {
    thisObject.mockedRequest.calls.reset();
    thisObject.mockedRequest.and.callThrough();

}

describe("Testing the get_expenses_list of  db facade", () => {

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

        const that = this;
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

describe("Testing the get_single of the db facade", function () {
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


describe("Test of the API facade's makeRequest", function () {

    beforeEach(function () {

        this.mockedHTTP = spyOn(http, 'request');

    });
    afterEach(function () {
        this.mockedHTTP.calls.reset();
        this.mockedHTTP.and.callThrough() // important, otherwise test runner panics at the disco
    });

    it("the api returning a 500 leads to a rejection", function (done) {
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("", 500)));


        Utils.makeRequest("http://wonderland:5000/api/test-500").then(function () {
            fail("Promise should have been rejected.");
            done()
        }, function (error) {
            expect(error.msg.indexOf("Status code is 500") !== -1).toBe(true);
            expect(error.statusCode).toBe(500);
            done();

        });
    });

    it("returning a 200 leads resolving the promise and parsing the json", function (done) {
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse('{"payload":"rebra"}', 200)));

        Utils.makeRequest("http://wonderland:5000/api/test-200").then(function (json) {
            expect(json.payload).toBe("rebra");
            done();
        }, function (err) {
            fail(err);
            done()
        })

    });
    it("POSTing data via the makeRequest will call http.request with correct params", function (done) {
    })
});

describe("testing", function () {
    beforeEach(function () {
        this.mockedRequest = spyOn(Utils, "makeRequest")
    });
    xit("asd", function (done) {

        this.mockedRequest.and.returnValue(Promise.resolve(2));

        this.mockedRequest("url").then(function (d) {
            expect(d).toBe(2);
            done();
        });
        done()
    })
})