import {DataStore, ExpenseDatabaseFacade} from "~/expense_datastore/datastore"
import {Expense} from "~/models/expense";
import {ResponseError} from "~/api_facade/common";
import {ten_expenses} from "~/tests/test_api_facade/sample_responses";
import * as u from "underscore";

/**
 * proxy = DataStore
 * api = ExpenseDatabaseFacade
 */

const exp = Expense.createEmptyExpense();
const persisted = {...exp, id: 1};

describe("For all methods of the DataStore", function () {
    /**
     * create a dict where the keys are the method names of a IExpenseDatabaseFacade
     * the values are objects. each object has key `mock` which is the mocked method of the facade; then
     * there's a key `call` which holds an 1-artity function taking as an argument a DataStore. the 1-artity function
     * prepares the datastore to be called and returns a call to the corresponding datastore method
     */
    function makeMocks() {
        let mocks = {
            persist: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'persist'),
                methodArgument: [exp],
                call: (ds) => {
                    return ds.persist.apply(ds, mocks.persist.methodArgument)
                }
            },
            update: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'update'),
                methodArgument: [persisted],
                apiResolvesWith: persisted,
                call: (ds) => {
                    ds.addExpense(persisted);
                    return ds.update.apply(ds, mocks.update.methodArgument)
                }
            },
            remove: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'remove'),
                methodArgument: [persisted],
                apiResolvesWith: undefined,
                call: (ds) => {
                    ds.addExpense(persisted);
                    return ds.remove.apply(ds, mocks.remove.methodArgument)
                }
            },
            get_list: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'get_list'),
                methodArgument: [1, 1],
                apiResolvesWith: [persisted],
                call: (ds: DataStore) => {
                    ds.addExpense(persisted);
                    return ds.get_list.apply(ds, mocks.get_list.methodArgument)
                }
            },
            get_single: {
                mock: <any>spyOn(ExpenseDatabaseFacade.prototype, 'get_single'),
                methodArgument: [1],
                apiResolvesWith: persisted,
                call: (ds) => {
                    return ds.get_single.apply(ds, mocks.get_single.methodArgument)
                }
            },
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
                let dataStore = new DataStore();
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
                mocks[methodName].call(new DataStore())
            });

            // verify that the datastore has called the API with the same argument
            setTimeout(() => {
                Object.keys(mocks).forEach((methodName) => {
                    expect(mocks[methodName].mock).toHaveBeenCalledTimes(1);
                    expect(mocks[methodName].mock).toHaveBeenCalledWith(...mocks[methodName].methodArgument)
                });
                done()
            }, 1000)


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
                    mocks[methodName].call(new DataStore()).then((value => {
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
        let dataStore = new DataStore();
        dataStore.persist(exp).then(persistedExp => {
            expect(persistedExp).toEqual(persisted);
            done()
        })
    });

    it('calling persist() on the proxy will forward the call to the api facade,' +
        'and will add to the datastore\'s list of expenses',
        function (done) {
            this.mockedPersist.and.returnValue(Promise.resolve(persisted));

            let dataStore = new DataStore();
            dataStore.persist(exp).then((persistedExp) => {
                    expect(persistedExp).toEqual(persisted);

                    expect(ExpenseDatabaseFacade.prototype.persist).toHaveBeenCalledWith(exp);
                    expect(dataStore.expenses.length).toBe(1);
                    expect(dataStore.expenses[0]).toEqual(persistedExp);
                    done()
                }, fail
            )
        });

    it('if persist() of the api facade rejects, then no expenses are added in the proxy',
        function (done) {
            this.mockedPersist.and.returnValue(Promise.reject(<ResponseError>{reason: "whatever", raw: null}));
            let dataStore = new DataStore();

            dataStore.persist(exp).then(fail, (_) => {
                expect(dataStore.expenses.length).toBe(0);
                done()
            })

        });
    it("if we try to persist an expense, and there's already an expense with a null id, we get an error", function (done) {
        let dataStore = new DataStore();
        // both have null ids. here the call to APIs.persist() also returns an expense with
        // null id which shouldn't be possible, what's important is that both expenses have the same id
        let firstExpense = {...exp};
        let secondExpense = {...exp};

        this.mockedPersist.and.returnValue(Promise.resolve(secondExpense));
        dataStore.addExpense(firstExpense);

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
        let toBeUpdated = {...exp};
        let newAmount = exp.amount + 1;
        let updated = {...toBeUpdated, amount: newAmount};
        this.mockedUpdate.and.returnValue(Promise.resolve(updated));

        let dataStore = new DataStore();
        dataStore.addExpense(toBeUpdated); // doesn't use the api; adds an expense internally to the datastore
        expect(dataStore.expenses.length).toBe(1);

        dataStore.update(toBeUpdated).then((updatedFromApi) => {
            expect(updatedFromApi).toEqual(updated);
            expect(dataStore.expenses.length).toBe(1);
            expect(dataStore.expenses[0].amount).toBe(newAmount);
            done()
        }, fail)
    });
    it("if trying to update an expense that's not in the datastore, " +
        "we get a rejected promise with a suitable msg", function (done) {
        new DataStore().update(ten_expenses[0]).then(fail, err => {
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
        new DataStore().remove(ten_expenses[0]).then(fail, err => {
            expect(err.reason.indexOf("No such expense in the DataStore") !== -1).toBe(true);
            done();
        })
    });
    it("if the api facade resolves, then the remove() of the datastore also resolves and also removes the" +
        "expense from its list", function (done) {
        this.mockedRemove.and.returnValue(Promise.resolve());
        let datastore = new DataStore();
        datastore.addExpense(persisted);
        expect(datastore.expenses.length).toBe(1);

        datastore.remove(persisted).then(_ => {
            expect(this.mockedRemove).toHaveBeenCalledTimes(1);
            expect(this.mockedRemove).toHaveBeenCalledWith(persisted);
            expect(datastore.expenses.length).toBe(0);
            done();
        }, fail)

    })
});

describe('testing the get_single() method of the DataStore', function () {
    beforeEach(function () {
        this.mockedGetSingle = <any> spyOn(ExpenseDatabaseFacade.prototype, 'get_single');
        this.mockedGetSingle.and.callThrough();
    });
    afterEach(function () {
        this.mockedGetSingle.calls.reset();
        this.mockedGetSingle.and.callThrough();
    });
    it("invoking get_single doesn't change the number of expenses in the datastore", function (done) {
        this.mockedGetSingle.and.returnValue(Promise.resolve(ten_expenses[0]));

        let dataStore = new DataStore();
        dataStore.get_single(1).then(exp => {
            expect(dataStore.expenses.length).toBe(0);
            done()
        }, fail)
    });

});