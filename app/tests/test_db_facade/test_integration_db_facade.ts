/**
 * Integration testing of the facade api
 *
 * */
import * as http from "http";
import {apiAddress} from "~/app_config";
import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {IExpense} from "~/models/expense";
import {testListExpenses} from "~/tests/test_db_facade/test_db_facade";
import {HttpResponse} from "tns-core-modules/http";

function apiIsUP(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let apiPingResponse: Promise<string> = http.getString({
            'url': `${apiAddress}api/ping`,
            'method': "GET",
            'timeout': 400
        });
        const rej = () => {
            reject(new Error("API IS NOT UP"))
        };


        apiPingResponse.then((response: string) => {
            if (response === 'pong') {
                resolve();
            } else {
                rej()
            }
        }, (err) => {
            rej()
        })
    });
}



/**
 * If the apiIsUp() promise resolves, then the api is up so we just call the done() to
 * tell jasmine that it can carry on with the specs in the suite. if the api's not up, the promise
 * will be rejected, so we'll save this as a boolean
 */
function setupTest(testThis, done) {
    testThis.apiIsUp = true;
    // https://metabroadcast.com/blog/asynchronous-testing-with-jasmine
    apiIsUP().then(done, () => {
        testThis.apiIsUp = false;
        done()
    })
}

describe("Integration test of the API facade for get_list", () => {
    beforeAll(function (done) {
        setupTest(this, done)
    });


    it("should return correct list of expenses when the facade is working", function () {
        if (!this.apiIsUp) {
            pending("API IS NOT UP")
        }
        let facade = new ExpenseDatabaseFacade();
        facade.get_list(1, 10).then((expenses: IExpense[]) => {
            testListExpenses(expenses, 1, 10)
        }, (err) => {
            let e = "The API should have returned a list of expenses";
            fail(e);
        })
    });

});


describe("Integration test of the API facade for get_single", function () {

    beforeAll(function (done) {
        setupTest(this, done);
    });

    xit("should return an item for id 1", function (done) {
        if (!this.apiIsUp) {
            pending("API IS NOT UP")
        }
        new ExpenseDatabaseFacade().get_single(1).then((item) => {
            expect(item.id).toBe(1);
            done()
        }, (err) => {
            fail("get_single's promise was rejected: " + err);
        });
    });

});

