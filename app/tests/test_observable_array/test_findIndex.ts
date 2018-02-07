import {ObservableArray} from "tns-core-modules/data/observable-array";
import "~/utils/add/ObservableArrayfindIndex"

describe("test the patched findIndex of ObservableArray", function () {
    it("returns -1 on empty array", function () {
        let arr: ObservableArray<string> = new ObservableArray([]);
        expect(arr.findIndex(higherOrderPredicate('boom'))).toBe(-1)

    });
    let higherOrderPredicate = (searchTerm) => {
        return (item) => {
            return item === searchTerm
        }
    };
    it('returns the correct index of an item in non-empty array', function () {
        let arr: ObservableArray<string> = new ObservableArray<string>(['sofia', 'plovdiv', 'varna', 'burgas']);

        expect(arr.findIndex(higherOrderPredicate('sofia'))).toBe(0);
        expect(arr.findIndex(higherOrderPredicate('plovdiv'))).toBe(1);
        expect(arr.findIndex(higherOrderPredicate('varna'))).toBe(2);
        expect(arr.findIndex(higherOrderPredicate('burgas'))).toBe(3);

    });
    it('returns the first index of an item appearing multiple times in the array', function () {
        let arr: ObservableArray<string> = new ObservableArray<string>(['sofia', 'sofia']);
        expect(arr.findIndex(higherOrderPredicate('sofia'))).toBe(0)

    });
});