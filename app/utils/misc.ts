import {Observable} from "tns-core-modules/data/observable";

export function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        hash = char + (hash << 6) + (hash << 16) - hash;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

//https://www.nativescript.org/blog/nativescript-observable-magic-string-property-name-be-gone
export function ObservableProperty() {
    return (target: Observable, propertyKey: string) => {
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return this["_" + propertyKey];
            },
            set: function (value) {
                if (this["_" + propertyKey] === value) {
                    return;
                }

                this["_" + propertyKey] = value;
                this.notify({
                    eventName: Observable.propertyChangeEvent,
                    propertyName: propertyKey,
                    object: this,
                    value,
                });
            },
            enumerable: true,
            configurable: true
        });
    };
}

//https://stackoverflow.com/a/42516869/4509634
export const propertyOf = <TObj>(name: keyof TObj) => name;


export enum COMPARE_RESULT {
    SMALLER = -1,
    EQUAL = 0,
    LARGER = 1
}