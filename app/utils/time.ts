import {COMPARE_RESULT} from "~/utils/misc";

let moment = require('moment');

export function currentTimeUTC(skipMilliseconds = false): string {
    return moment().toISOString();
}

export function currentTimeLocal(): string {
    return moment().format()
}

export function localTimeToUtc(local) {
    return moment(local).toISOString()
}

export type timeOperation = "add" | "subtract"
export type timeModifier = "days" | "weeks"

export function timeOperations(opts: { baseTime: string, action: timeOperation, amount: number, modifier: timeModifier }) {
    if (!moment(opts.baseTime).isValid()) {
        throw new Error(`${opts.baseTime} is not a valid momentjs datetime`)
    }
    return moment()[opts.action](opts.amount, opts.modifier)
}


export function startOfWeek(base: string) {
    let dt = moment(resetSubdayProperties(base));
    return dt.weekday(0).format()
}

export function startOfPreviousWeek(base: string) {
    let dt = moment(resetSubdayProperties(base));
    return dt.weekday(-7).format()
}

export function startOfMonth(base: string) {
    let dt = moment(resetSubdayProperties(base));
    return dt.date(1).format()
}

export function startOfPreviousMonth(base) {
    let dt = moment(resetSubdayProperties(base));
    return dt.month(dt.month() - 1).date(1).format()
}

function resetSubdayProperties(base) {
    let dt = moment(base);

    let options = {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    };

    Object.keys(options).forEach(option => {
        dt[option](options[option]) // momentjs's set() methods have side effects
    });

    return dt.format()
}

export function compareDatetimes(a, b): COMPARE_RESULT {
    let aIso = moment(a).toISOString();
    let bIso = moment(b).toISOString();
    if (aIso > bIso) {
        return COMPARE_RESULT.LARGER
    } else if (aIso < bIso) {
        return COMPARE_RESULT.SMALLER
    } else {
        return COMPARE_RESULT.EQUAL
    }
}

export function readableTimestamp(timestamp_utc: string): string {
    return moment(timestamp_utc).calendar()
}