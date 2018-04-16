
var moment = require('moment');

function NextScheduleDateResponse(nextScheduleDate, maxOrderDuration) {
    this.nextScheduleDate = nextScheduleDate.format('DD/MM/YYYY HH:mm');
    this.maxOrderDuration = maxOrderDuration;
}

module.exports = NextScheduleDateResponse;