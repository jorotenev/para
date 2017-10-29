import {ExpenseDatabaseFacade} from "~/expense/db_facade/facade";
import {ten_results} from './sample_responses';
import {http} from "~/expense/db_facade/facade"
import {IExpense} from "~/models/expense";

var u = require('underscore');
var mocker = require('ts-mockito');

const promised_ten_results = new Promise(function(resolve, _){
    resolve(ten_results)
});


// A sample Jasmine test
describe("Testing the db facade", async () => {
    it("Getting a list of expenses", async () => {

        const startFromId = 1;
        const batchSize = 10;
        const endpointURL = ExpenseDatabaseFacade.GETListEndpointTemplate({
            startFromId: startFromId,
            batchSize: batchSize
        });
        console.log(endpointURL);


        // mock http.getJSON
        spyOn(http, 'getJSON').and.returnValue(promised_ten_results);
        let spiedGetJSON: any = http.getJSON;

        // Call the method that we actually test now and store the return value:
        let promised_result : Promise<IExpense[]> = new ExpenseDatabaseFacade().get_list(startFromId, batchSize);

        // sanity checking - the method we test has called getJSON with the correct url
        expect(spiedGetJSON.calls.first().args).toEqual([endpointURL]);

        // the result of the tested method invocation is of correct type
        expect(promised_result && !!promised_result.then && typeof promised_result.then === 'function').toBe(true);

        // unbox the result
        let settled_result : IExpense[] = await promised_result;

        expect(typeof settled_result).toBe(typeof []);
        expect(settled_result[0].id).toBe(startFromId);
        expect(settled_result.length).toBe(batchSize);
    });

});
