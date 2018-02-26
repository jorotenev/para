import {firebase, http, RawResponseError, Utils} from "~/api_facade/common";
import {HTTPMethod} from "~/api_facade/db_facade";
import {HttpResponse} from "tns-core-modules/http";
import objectContaining = jasmine.objectContaining;

export function fakeHTTPResponse(raw, statusCode): HttpResponse {
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

describe("Test of the Utils.makeRequest()", function () {

    beforeEach(function () {

        this.mockedHTTP = spyOn(http, 'request');
        this.mockedHTTP.and.callThrough();
        this.mockedFirebase = spyOn(firebase, "getAuthToken");
        this.mockedFirebase.and.returnValue(Promise.resolve('fake token'))

    });
    afterEach(function () {
        this.mockedHTTP.calls.reset();
        this.mockedHTTP.and.callThrough();  // important, otherwise test runner panics at the disco

        this.mockedFirebase.calls.reset();
        this.mockedFirebase.and.callThrough();
    });
    it("the api returning a 500 leads to a rejection", function (done) {
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("[]", 500)));


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

        Utils.makeRequest("wonderland/api/test-200").then(function (json) {
            expect(json.payload).toBe("rebra");
            done();
        }, function (err) {
            fail(err);
            done();
        })

    });
    it("POSTing data via the makeRequest will call http.request with correct params", function (done) {
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("[]", 200)))

        const url = "fake url";
        const post_data = {
            lunch: 'meatballs'
        };

        Utils.makeRequest(url, HTTPMethod.POST, post_data).then(() => {
                try {
                    let call = expect(this.mockedHTTP).toHaveBeenCalledTimes(1)
                    let optionsArg = this.mockedHTTP.calls.argsFor(0)[0]; // the first arg for the first call

                    expect(optionsArg.hasOwnProperty('content')).toBe(true);
                    expect(optionsArg.content).toBe(JSON.stringify(post_data));
                    done()
                } catch (error) {
                    fail(error)
                }
            }, (err) => {
                fail(err);
                done()
            }
        )
    });
    it("POSTing empty payload is fine", function (done) {
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("[]", 200)))
        // it's ok to post without any payload.
        Utils.makeRequest("asd", HTTPMethod.POST).then(done, fail)
    });

    it("POSTing invalid type fails", function (done) {
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("[]", 200)))
        Utils.makeRequest('asd', HTTPMethod.POST, () => {
        }).then(fail, (err) => {
            try {
                expect(err.msg.indexOf("Invalid JSON passed. Result of stringify") !== -1).toBe(true);
                done()
            } catch (e) {
                fail(e)
            }
        })
    });

    it("if the auth token can't be obtained, " +
        "no request is made and the promise is rejected with a suitable msg", function (done) {
        this.mockedFirebase.and.returnValue(Promise.reject(''));
        const that = this;
        Utils.makeRequest('whatevs').then(function (_) {
            fail("Promise should have been rejected");
            done();
        }, function (error: RawResponseError) {
            expect(error.msg.indexOf("token") !== -1).toBe(true);
            expect(that.mockedHTTP.calls.count()).toEqual(0);
            done();
        });
    });

    it("request headers include auth token", function (done) {
        const that = this;
        this.mockedHTTP.and.returnValue(Promise.resolve(fakeHTTPResponse("[]", 200)));
        Utils.makeRequest('whatev').then(() => {
            try {
                expect(that.mockedHTTP.calls.count()).toBe(1);
                let args = that.mockedHTTP.calls.argsFor(0)[0]; // the `options` argument of the first call
                let headers = args.headers; // array of (header) objects
                expect(headers).toEqual(objectContaining({[Utils.tokenHeader]: "fake token"}));
                done();
            } catch (err) {
                fail(err)
            }
        }, () => {
            fail();
            done();
        })
    });
});

describe("Test the Utils.makeRequestOpts()", function () {
    beforeAll(function () {
        this.url = 'some url'
        this.method = HTTPMethod.GET
        this.payload = {some: 'object'}
        this.timeout = 1000
    })
    beforeEach(function () {
        this.mockedMakeRequest = spyOn(Utils, 'makeRequest')
    })
    afterEach(function () {
        this.mockedMakeRequest.calls.reset()
    })

    it("makeRequest gets called with correct args", function () {
        let url = 'some url'
        Utils.makeRequestOpts({url: this.url, method: this.method, payload: this.payload, timeout: this.timeout})

        expect(this.mockedMakeRequest.calls.count()).toBe(1)
        expect(this.mockedMakeRequest).toHaveBeenCalledWith(this.url, this.method, this.payload, this.timeout)
    })
    it("correct default are used", function () {
        Utils.makeRequestOpts({url: this.url})
        expect(this.mockedMakeRequest).toHaveBeenCalledWith(this.url, undefined, undefined, undefined)

        this.mockedMakeRequest.calls.reset()
        Utils.makeRequestOpts({url: this.url, payload: this.payload})
        expect(this.mockedMakeRequest).toHaveBeenCalledWith(this.url, undefined, this.payload, undefined)
    })
});