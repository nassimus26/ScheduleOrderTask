
var moment = require('moment');

function Schedule(day, start, end) {
    this.scheduleId = uuidv4();
    this.day = day;
    this.start = start;
    this.end = end;
    this.startTime = fillDateWithMinutes(this.day, this.start);
    this.endTime = fillDateWithMinutes(this.day, this.end);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function fillDateWithMinutes(dateAsStr, minutes){
    var md = new moment(dateAsStr, 'DD/MM/YYYY');
    md.hour(Math.floor(minutes/60));
    md.minute(minutes%60);
    return md;
}

module.exports = Schedule;