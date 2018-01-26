let moment = require('moment');

export function currentTimeUTC(skipMilliseconds=false): string {
    return moment().toISOString();
}

export function readableTimestamp(timestamp_utc: string): string {
    return moment.utc(timestamp_utc).calendar()
}