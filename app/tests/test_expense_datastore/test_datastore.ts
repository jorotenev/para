import {DataStore, ExpenseDatabaseFacade, IDataStore} from "~/expense_datastore/datastore"
import {Expense, IExpense} from "~/models/expense";
import {ResponseError} from "~/api_facade/common";
import {SINGLE_EXPENSE, ten_expenses} from "~/tests/test_api_facade/sample_responses";
import * as u from "underscore";
import {SyncRequest, TimePeriod} from "~/api_facade/types";
import {GetListOpts, SyncResponse} from "~/api_facade/types";
import {IExpenseDatabaseFacade} from "~/api_facade/db_facade";
import {currentTimeLocal} from "~/utils/time";

/**
 * proxy = DataStore
 * api = ExpenseDatabaseFacade
 */

const exp: IExpense = Object.freeze({...SINGLE_EXPENSE, id: null});
const persisted: IExpense = Object.freeze({...exp, id: 'asd'});

function cleanDataStore() {
    DataStore._instance = null;
    return DataStore.getInstance()
}

describe("For all methods of the DataStore", function () {
    /**
     * create a dict where the keys are the method names of a IExpenseDatabaseFacade
     * the values are objects. each object has key `mock` which is the mocked method of the facade; then
     * there's a key `call` which holds an 1-artity function taking as an argument a DataStore. the 1-artity function
     * prepares the datastore to be called and returns a call to the corresponding datastore method
     */
    function makeMocks() {
        let mocks = { // todo compile-time check that all IExpenseDatabaseFacade methods are covered
            persist: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'persist'),
                methodArgument: [exp],
                call: (ds) => {
                    return ds.persist.apply(ds, mocks.persist.methodArgument)
                }
            },
            update: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'update'),
                methodArgument: [persisted, persisted],
                apiResolvesWith: persisted,
                call: (ds) => {
                    ds._addExpense(persisted);
                    return ds.update.apply(ds, mocks.update.methodArgument)
                }
            },
            remove: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'remove'),
                methodArgument: [persisted],
                apiResolvesWith: undefined,
                call: (ds) => {
                    ds._addExpense(persisted);
                    return ds.remove.apply(ds, mocks.remove.methodArgument)
                }
            },
            get_list: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'get_list'),
                methodArgument: [<GetListOpts>{start_from: persisted, batch_size: 1}],
                apiResolvesWith: [persisted],
                call: (ds: DataStore) => {
                    ds._addExpense(persisted);
                    return ds.get_list.apply(ds, mocks.get_list.methodArgument)
                }
            },
            sync: {
                mock: <any> spyOn(ExpenseDatabaseFacade.prototype, 'sync'),
                methodArgument: [<SyncRequest>[ten_expenses[0]]],
                apiResolvesWith: <SyncResponse>{to_add: [], to_update: [], to_remove: []},
                call: (ds: DataStore) => {
                    return ds.sync.apply(ds, mocks.sync.methodArgument)
                }
            },
            get_statistics: {
                mock: <any> spyOn(ExpenseDatabaseFacade.prototype, 'get_statistics'),
                methodArgument: [<TimePeriod>{to_dt_local: currentTimeLocal(), from_dt_local: currentTimeLocal()}], // todo flaky
                apiResolvesWith: {"BGN": 100},
                call: (ds: DataStore) => {
                    return ds.get_statistics.apply(ds, mocks.get_statistics.methodArgument)
                }
            }
        };
        return mocks
    }


    it(" if the API's promise rejects then the DataStore's method should reject with the same reason",
        function (done) {
            let mocks = makeMocks();
            // all calls to the facade are rejected.
            Object.keys(mocks).forEach((methodName) => {
                mocks[methodName].mock.and.returnValue(Promise.reject(<ResponseError>{reason: 'some reason'}))
            });

            const numAll = Object.keys(mocks).length;
            let numCorrectlyRejected = 0;
            let failMsg = [];

            Object.keys(mocks).forEach((methodName) => {
                let dataStore = cleanDataStore();
                try {
                    mocks[methodName].call(dataStore).then(fail, err => {
                        if (err.reason === 'some reason') {
                            numCorrectlyRejected++;
                        } else {
                            failMsg.push({expected: 'some reason', actual: err.reason, context: methodName})
                        }
                    })
                } catch (err) {
                    failMsg.push({raw: err, context: methodName})
                }
            });
            setTimeout(() => {
                if (numAll === numCorrectlyRejected) {
                    done()
                } else {
                    fail(failMsg)
                }
            })
        });

    it("the method of the API is called with the same argument as the one of the DataStore, once",
        function (done) {
            let mocks = makeMocks();

            // call the datastore's methods
            Object.keys(mocks).forEach(methodName => {
                mocks[methodName].mock.and.returnValue(Promise.resolve(mocks[methodName].apiResolvesWith));
                mocks[methodName].call(cleanDataStore())
            });

            // verify that the datastore has called the API with the same argument
            setTimeout(() => {
                Object.keys(mocks).forEach((methodName) => {
                    if (methodName === 'get_list') {
                        console.dir(mocks[methodName].mock.calls.first())
                    }
                    expect(mocks[methodName].mock).toHaveBeenCalledTimes(1);
                    expect(mocks[methodName].mock).toHaveBeenCalledWith(...mocks[methodName].methodArgument)
                });
                done()
            }, 500)


        });
    it("the method of the DataStore resolves with the same value as the one resolved from the API",
        function (done) {
            let mocks = makeMocks();
            // set the return value of the API method
            Object.keys(mocks).forEach((methodName) => {
                mocks[methodName].mock.and.returnValue(Promise.resolve(mocks[methodName].apiResolvesWith))
            });


            let numSuccessful = 0;
            const numAll = Object.keys(mocks).length;
            let failMsgs = [];
            // call the API method and increment a counter if the call resolved with the expected value
            Object.keys(mocks).forEach(methodName => {
                try {
                    mocks[methodName].call(cleanDataStore()).then((value => {
                        let expected = mocks[methodName].apiResolvesWith;
                        if (u.isEqual(value, expected)) {
                            numSuccessful++;
                        } else {
                            failMsgs.push({
                                expected: expected,
                                actual: value,
                                context: methodName,
                            })
                        }
                    }), err => {
                        failMsgs.push({context: methodName, raw: err,})
                    })
                } catch (error) {
                    failMsgs.push({context: methodName, raw: error,})
                }
            });

            setTimeout(() => {
                if (numSuccessful !== numAll) {
                    fail(failMsgs)
                } else {
                    done()
                }
            }, 500)
        })
});

describe('testing the persist() method of the DataStore', function () {
    beforeEach(function () {
        spyOn(ExpenseDatabaseFacade.prototype, 'persist');
        this.mockedPersist = <any> ExpenseDatabaseFacade.prototype.persist
    });

    afterEach(function () {
        this.mockedPersist.calls.reset()
    });


    it('calling persist() of the proxy will return a promise that will be resolved' +
        'with the same object as the one that the API\'s persist() has resolved with', function (done) {
        this.mockedPersist.and.returnValue(Promise.resolve(persisted));
        let dataStore = cleanDataStore();
        dataStore.persist(exp).then(persistedExp => {
            expect(persistedExp).toEqual(persisted);
            done()
        })
    });

    it('calling persist() on the proxy will forward the call to the api facade,' +
        'and will add to the datastore\'s list of expenses',
        function (done) {
            this.mockedPersist.and.returnValue(Promise.resolve(persisted));

            let dataStore = cleanDataStore();
            dataStore.persist(exp).then((persistedExp) => {
                    expect(persistedExp).toEqual(persisted);

                    expect(ExpenseDatabaseFacade.prototype.persist).toHaveBeenCalledWith(exp);
                    expect(dataStore.expenses.length).toBe(1);
                    expect(dataStore.expenses.getItem(0)).toEqual(persistedExp);
                    done()
                }, fail
            );
        });

    it('if persist() of the api facade rejects, then no expenses are added in the proxy',
        function (done) {
            this.mockedPersist.and.returnValue(Promise.reject(<ResponseError>{reason: "whatever", raw: null}));
            let dataStore = cleanDataStore();

            dataStore.persist(exp).then(fail, (_) => {
                expect(dataStore.expenses.length).toBe(0);
                done()
            })

        });
    it("if we try to persist an expense, and there's already an expense with a null id, we get an error", function (done) {
        let dataStore = cleanDataStore();
        // both have null ids. here the call to APIs.persist() also returns an expense with
        // null id which shouldn't be possible, what's important is that both expenses have the same id
        let firstExpense = {...exp};
        let secondExpense = {...exp};

        this.mockedPersist.and.returnValue(Promise.resolve(secondExpense));
        dataStore._addExpense(firstExpense);

        dataStore.persist(secondExpense).then(fail, err => {
            expect(err.reason.indexOf("Expenses with the same id") !== -1).toBe(true);
            done()
        })
    })
});

describe('testing the update() method of the DataStore', function () {
    beforeEach(function () {
        spyOn(ExpenseDatabaseFacade.prototype, 'update');
        this.mockedUpdate = <any> ExpenseDatabaseFacade.prototype.update;
    });
    afterEach(function () {
        this.mockedUpdate.calls.reset()
    });

    it("update()ing an expense via the proxy will update the object held by the proxy with the resolved value " +
        "that the api returned", function (done) {
        let toBeUpdated = {...persisted, amount: 1};

        let newAmount = persisted.amount + 1;
        let updated = {...toBeUpdated, amount: newAmount};
        this.mockedUpdate.and.returnValue(Promise.resolve(updated));

        let dataStore = cleanDataStore();
        dataStore._addExpense(toBeUpdated); // doesn't use the api; adds an expense internally to the datastore
        expect(dataStore.expenses.length).toBe(1);

        dataStore.update(updated, toBeUpdated).then((updatedFromApi) => {
            expect(updatedFromApi).toEqual(updated);
            expect(dataStore.expenses.length).toBe(1);
            let ds_exp = dataStore.expenses.getItem(0);

            expect(ds_exp.amount).toBe(newAmount);
            done()
        }, fail)
    });
    it("if trying to update an expense that's not in the datastore, " +
        "we get a rejected promise with a suitable msg", function (done) {
        let expense = {...SINGLE_EXPENSE};
        cleanDataStore().update(expense, null).then(fail, err => {
            expect(err.reason.indexOf("not in the datastore") !== -1).toBe(true)
            done()
        })
    });

});

describe("testing the remove() methods of the DataStore", function () {
    beforeEach(function () {
        this.mockedRemove = <any> spyOn(ExpenseDatabaseFacade.prototype, 'remove');
        this.mockedRemove.and.callThrough();

    });
    afterEach(function () {
        this.mockedRemove.calls.reset();
        this.mockedRemove.and.callThrough();
    });
    it("rejects if there's not expense with this id", function (done) {

        cleanDataStore().remove({...SINGLE_EXPENSE}).then(fail, err => {
            expect(err.reason.indexOf("No such expense in the DataStore") !== -1).toBe(true);
            done();
        })
    });
    it("if the api facade resolves, then the remove() of the datastore also resolves and also removes the" +
        "expense from its list", function (done) {
        let secondExpense = Object.freeze({...exp, id: "obqdwah surmi", amount: 123});

        // the API will successfully remove the expense
        this.mockedRemove.and.returnValue(Promise.resolve());

        let datastore = cleanDataStore();
        datastore._addExpense(persisted);
        datastore._addExpense(secondExpense);
        expect(datastore.expenses.length).toBe(2);

        datastore.remove(persisted).then(_ => {
            expect(this.mockedRemove).toHaveBeenCalledTimes(1);
            expect(this.mockedRemove).toHaveBeenCalledWith(persisted);
            expect(datastore.expenses.length).toBe(1);
            expect(datastore.expenses.getItem(0).amount).toBe(secondExpense.amount);

            done();
        }, fail)

    })
});

describe('testing the get_list() method of the DataStore', function () {
    beforeEach(function () {
        this.mockedGetList = <any> spyOn(ExpenseDatabaseFacade.prototype, 'get_list');
        this.mockedGetList.and.callThrough();
    });

    afterEach(function () {
        this.mockedGetList.calls.reset();
        this.mockedGetList.and.callThrough();
    });

    it("invoking get_list doesn't change the contents of DataStore.expenses", function (done) {
        let dataStore = cleanDataStore();
        dataStore._addExpense(exp);
        this.mockedGetList.and.returnValue(Promise.resolve({...exp, id: 2}));
        let request_opts: GetListOpts = {
            start_from: {...ten_expenses[1]},
            batch_size: 1
        };
        dataStore.get_list(request_opts).then((_) => {
            expect(dataStore.expenses.indexOf(exp)).toEqual(0);
            expect(dataStore.expenses.length).toEqual(1);
            done();
        }, fail)
    });
});

describe('testing the sync() method of the DataStore', function () {
    beforeAll(function () {
        let request: SyncRequest = ten_expenses.slice(0, 3);
        this.request = request;
    });

    beforeEach(function () {
        this.mockedSync = <any> spyOn(ExpenseDatabaseFacade.prototype, 'sync');
        this.mockedSync.and.callThrough();
    });

    afterEach(function () {
        this.mockedSync.calls.reset();
        this.mockedSync.and.callThrough();
    });

    it("items in the .to_add are added to the datastore", function (done) {
        const sample_response: SyncResponse = {
            to_add: [ten_expenses[4]],
            to_remove: [],
            to_update: [],
        };
        this.mockedSync.and.returnValue(Promise.resolve(sample_response));

        let ds = cleanDataStore();
        ds.sync(this.request).then((response: SyncResponse) => {
            expect(ds.expenses.length).toBe(1);
            expect(ds.expenses.getItem(0)).toEqual({...response.to_add[0]});
            done()
        }, fail)

    });
    it("items in the .to_updated result in the items being updated in the DataStore", function (done) {
        const new_amount = SINGLE_EXPENSE.amount + 10;
        const sample_response: SyncResponse = {
            to_update: [{...SINGLE_EXPENSE, amount: new_amount}],
            to_add: [],
            to_remove: []
        };

        this.mockedSync.and.returnValue(Promise.resolve(sample_response));

        let ds = cleanDataStore();
        ds._addExpense({...SINGLE_EXPENSE});

        //sanity checking
        expect(ds.expenses.getItem(0).amount).toBe(SINGLE_EXPENSE.amount);

        ds.sync(this.request).then((response: SyncResponse) => {
            expect(ds.expenses.getItem(0).amount).toEqual(new_amount)
            done()
        }, fail)
    });

    it('non-existing items in the datastore which we need to *update* are ignored', function (done) {
        const new_amount = SINGLE_EXPENSE.amount + 10;
        const sample_response: SyncResponse = {
            to_update: [{...SINGLE_EXPENSE, amount: new_amount}, {...ten_expenses[1]}],
            to_add: [],
            to_remove: []
        };

        this.mockedSync.and.returnValue(Promise.resolve(sample_response));

        let ds = cleanDataStore();
        ds._addExpense({...SINGLE_EXPENSE});
        ds.sync(this.request).then(response => {
            expect(ds.expenses.length).toBe(1);
            expect(ds.expenses.getItem(0).amount).toBe(new_amount);
            expect(ds.expenses.getItem(0).id).toBe(SINGLE_EXPENSE.id);
            done();
        }, fail)
    });
    it("items which need to be removed are removed and items not managed by the datastore are ignored", function (done) {
        const sample_response: SyncResponse = {
            to_remove: [SINGLE_EXPENSE.id, ten_expenses[2].id],
            to_update: [],
            to_add: []
        };
        this.mockedSync.and.returnValue(Promise.resolve(sample_response));

        let ds = cleanDataStore();
        ds._addExpense({...SINGLE_EXPENSE});
        ds._addExpense({...ten_expenses[1]});

        ds.sync(this.request).then(response => {
            expect(ds.expenses.length).toBe(1);

            expect(ds.expenses.getItem(0)).toEqual({...ten_expenses[1]});
            done()
        }, fail)
    });

});


describe("test the _addExpense of the DataStore", function () {

    it("adding through _addExpense adds it to the .expenses of the DataStore", function () {
        let ds = cleanDataStore();
        expect(ds.expenses.length).toBe(0);
        ds._addExpense({...SINGLE_EXPENSE});
        expect(ds.expenses.length).toBe(1);
        expect(ds.expenses.getItem(0)).toEqual({...SINGLE_EXPENSE})
    });
    it("adding an already managed expense throws an error", function () {

        let ds = cleanDataStore();
        ds._addExpense({...SINGLE_EXPENSE});

        try {
            ds._addExpense({...SINGLE_EXPENSE});
            fail()
        } catch (err) {
            expect(err.reason.indexOf("Expenses with the same id") !== -1).toBe(true);
        }
    });
    it("adding expenses in random order keeps the .expenses sorted from largest id to smallest", function () {

        let ds = cleanDataStore();
        let sixth = ten_expenses[5];
        let fourth = ten_expenses[3];
        let third = ten_expenses[2];

        ds._addExpense({...fourth});
        ds._addExpense({...sixth});
        ds._addExpense({...third});

        expect(ds.expenses.map(exp => exp.id)).toEqual([sixth.id, fourth.id, third.id])
    });
});

describe("test the _removeExpense of the DataStore", function () {

    it("removes managed expenses", function () {
        let ds = cleanDataStore();
        ds._addExpense({...ten_expenses[0]});
        ds._addExpense({...ten_expenses[1]});
        expect(ds.expenses.length).toBe(2);

        ds._removeExpense(ten_expenses[0].id);
        expect(ds.expenses.length).toBe(1);

        ds._removeExpense(ten_expenses[1].id);
        expect(ds.expenses.length).toBe(0)
    });

    it("panics if trying to remove non-managed expense", function () {
        let ds = cleanDataStore();

        let shouldExplode2 = () => ds._removeExpense(SINGLE_EXPENSE.id);
        expect(shouldExplode2).toThrowError("no managed expense with such id")
    });

});