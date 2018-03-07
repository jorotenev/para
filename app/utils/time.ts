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