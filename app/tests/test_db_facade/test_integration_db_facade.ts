/**
 * Integration testing of the facade api
 *
 * */
import * as http from "http";
import {apiAddress} from "~/app_config";
import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {IExpense} from "~/models/expense";
import {test_list_expenses} from "~/tests/test_db_facade/test_db_facade";

var isApiUp = false;
function apiIsUP(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let apiPingResponse: Promise<string> = http.getString({
            'url': `${apiAddress}ping`,
            'method': "GET",
            'timeout': 300
        });
        const rej = ()=>{reject(new Error("API IS NOT UP"))}


        apiPingResponse.then((response: string) => {
            if (response === 'pong') {
                resolve()
            } else {
                rej()
            }
        }).catch((err)=>{
            console.error(err)
            rej()
        })
    });
}

describe("Integration test of the API facade", () => {
    beforeAll(function (done) {
        /**
        * If the apiIsUp() promise resolves, then the api is up so we just call the done() to 
        * tell jasmine that it can carry on with the specs in the suite. if the api's not up, the promise
        * will be rejected, so we'll save this as a boolean and skip all specs in the suite. 
        */
        this.apiIsUp = true;
        const that = this;
        // https://metabroadcast.com/blog/asynchronous-testing-with-jasmine
        apiIsUP().then(done).catch(()=>{
            that.apiIsUp = false;
        })
    });

    beforeEach(function(){
        if (!this.apiIsUp){
            const e = "Api is not UP :("
            console.error(e)
            // skip all tests in this spec.
            pending(e)
        }
    })

    it("should return correct list of expenses when the facade is working", () => {
        let facade = new ExpenseDatabaseFacade();
        facade.get_list(1, 10).then((expenses: IExpense[]) => {
            test_list_expenses(expenses, 1, 10)
        }, (_) => {
            let e = "The API should have returned a list of expenses";
            fail(e)
        })
    });
});


