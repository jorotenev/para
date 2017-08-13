let moment = require('moment');

export function currentTime(){
    return moment().toISOString();
}