import {ValueConverter} from "tns-core-modules/ui/core/bindable";

export let numberConverter: ValueConverter = {

    toView: function (val) {
        return val;
    },
    toModel: function (val) {
        return Number(val)
    }
};
