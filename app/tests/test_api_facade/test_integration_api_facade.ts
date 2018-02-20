/**
 * Integration testing of the facade api
 *
 * */
import * as http from "http";
import {apiAddress} from "~/app_config";
import {mockFirebaseAfterEach, mockFirebaseBeforeEach} from "./test_api_facade";

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
    beforeEach(function () {
        mockFirebaseBeforeEach.call(this)
    });
    afterEach(function () {
        mockFirebaseAfterEach.call(this)
    });


    it("should return correct list of expenses when the facade is working", function () {
        if (!this.apiIsUp) {
            pending("API IS NOT UP")
        }
        fail("not implemented")
    });

});

