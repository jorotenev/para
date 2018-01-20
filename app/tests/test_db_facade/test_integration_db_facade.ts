/**
 * Integration testing of the facade api
 *
 * */
import * as http from "http";
import {apiAddress} from "~/app_config";
import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {IExpense} from "~/models/expense";
import {test_list_expenses} from "~/tests/test_db_facade/test_db_facade";

function apiIsUP(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let apiPingResponse: Promise<string> = http.getString({
            'url': `${apiAddress}api/ping`,
            'method': "GET",
            'timeout': 400
        });
        const rej = ()=>{reject(new Error("API IS NOT UP"))}


        apiPingResponse.then((response: string) => {
            if (response === 'pong') {
                console.log("RESPONSE IS RESOLVING");
                resolve();
            } else {
                console.log("RESPONSE IS BAD");
                rej()
            }
        }).catch((err)=>{
            console.error(err);
            console.error("GOT ONREJECTED");
            rej()
        })
    });
}

describe("Integration test of the API facade for get_list", () => {
    beforeAll(function (done) {
        /**
        * If the apiIsUp() promise resolves, then the api is up so we just call the done() to 
        * tell jasmine that it can carry on with the specs in the suite. if the api's not up, the promise
        * will be rejected, so we'll save this as a boolean
        */
        this.apiIsUp = true;
        const that = this;
        // https://metabroadcast.com/blog/asynchronous-testing-with-jasmine
        apiIsUP().then(done, ()=>{
            that.apiIsUp = false;
            console.log("SETTING APIISUP VALUE TO FALSE")
            done()
        })
    });


    it("should return correct list of expenses when the facade is working", function(){
        if (!this.apiIsUp){
            pending("API IS NOT UP")
        }


        console.log("EXECUTING THE TEST" + this.apiIsUp)
        let facade = new ExpenseDatabaseFacade();
        facade.get_list(1, 10).then((expenses: IExpense[]) => {
            test_list_expenses(expenses, 1, 10)
            console.log(`Received ${expenses.length} expenses!`)
        }, (err) => {
            let e = "The API should have returned a list of expenses";
            console.error(err);
            fail(e);
        })
    });

});



