/**
 * patch the ObservableArray of the NativeScript
 * use `import '~/utils/add/ObservableArrayfindIndex'
 */
import {ObservableArray} from "tns-core-modules/data/observable-array";

declare module 'tns-core-modules/data/observable-array' {
    interface ObservableArray<T> {
        findIndex(predicate: (item: T) => boolean): number
    }
}

ObservableArray.prototype.findIndex = function (f) {
    let indexOfItem = -1;
    this.some((item, index) => {
        if (f(item)) {
            indexOfItem = index;
            return true
        }
    });
    return indexOfItem
};
console.log("ObsersableArray patched with findIndex");
