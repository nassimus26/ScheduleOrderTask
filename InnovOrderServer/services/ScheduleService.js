/**
 * ScheduleService.js
 *
 * Support basic Add/Remove/list Schedule.
 * Instead of using DataBase we use a simple Array
 */

require('../models/Schedule');
var scheduleConfig = require('../config/ScheduleCfg');
var Schedule = require('../models/Schedule');
var moment = require('moment');
var schedules = [];

function list(){
    return schedules;
}

function create(schedule) {
    if (schedule.startTime.toDate().getTime() < new Date().getTime())
        throw new Error('Order schedule cannot happens in the past');
    if (schedule.startTime.toDate().getTime() >= schedule.endTime.toDate().getTime())
        throw new Error('Schedule end must superior than the Schedule start');
    if (schedule.start%scheduleConfig.timeStep!=0 || schedule.end%scheduleConfig.timeStep!=0)
        throw new Error('Schedule start or end must be multiple of '+scheduleConfig.timeStep);
    var overlapItems = findOverlapItems(schedule);
    if (overlapItems.length>0)
        throw new Error('Adding the new schedule failed, overlap detected');
    schedules.push(schedule);
    sortSchedulesByDate();
    return schedules[schedules.length-1];
}
function sortSchedulesByDate(){
    schedules.sort(function compare(a, b){
        var comparison = 0;
        if (a.startTime.toDate().getTime() > b.startTime.toDate().getTime()) {
            comparison = 1;
        } else if (b.startTime.toDate().getTime() > a.startTime.toDate().getTime()) {
            comparison = -1;
        }
        return comparison;
    });

}

function getNextScheduleDate() {
    if (!schedules.length){
        return fixDateByTimeStep(new Date());
    } else {
        var now = new moment(fixDateByTimeStep(new Date()));
        var nowStart = now.minutes()+now.hour()*60;
        var possibleSchedule = new Schedule(now.format('DD/MM/YYYY'), nowStart, nowStart+scheduleConfig.timeStep);
        var overlaps = findOverlapItems(possibleSchedule);
        if (!overlaps.length)
            return now.toDate();
        for (i in schedules) {
            var schedule = schedules[i];
            var minimalStartDate = addDelay(schedule.endTime);
            var minimalStart = minimalStartDate.minutes()+minimalStartDate.hour()*60;
            var possibleSchedule = new Schedule(minimalStartDate.format('DD/MM/YYYY'), minimalStart, minimalStart+scheduleConfig.timeStep);
            var overlaps = findOverlapItems(possibleSchedule);
            if (!overlaps.length){
                return minimalStartDate.toDate();
            }
        }
        return fixDateByTimeStep(new Date());
    }
}

function fixDateByTimeStep(date){
    var mnt = new moment(date);
    var mintues = mnt.get('minute');
    var mintuesFloor = Math.floor(mintues/scheduleConfig.timeStep)*scheduleConfig.timeStep;
    if (mintuesFloor<mintues || mintues== new moment(new Date()).minutes())
        mintuesFloor +=scheduleConfig.timeStep;
    mnt.minute(mintuesFloor);
    return mnt.toDate();
}

function remove(scheduleId){
    schedules = schedules.filter( function(item) {
        return !(item.scheduleId == scheduleId);
    });
    return schedules;
}

function globalDelay (){
    var delay = scheduleConfig.preparationDelay + scheduleConfig.rushDelay;
    var nbr_step = Math.floor(delay/scheduleConfig.timeStep);
    if (nbr_step*scheduleConfig.timeStep <delay )
        delay = (nbr_step+1)*scheduleConfig.timeStep;
    return delay;
}

function clear(){
    schedules = [];
}

function addDelay(date) {
    return new moment(date.toDate()).add(globalDelay(), 'minute');
}

function findOverlapItems(schedule){
    return schedules.filter( function(item) {
        return  (item.day == schedule.day && (
                ( schedule.startTime.isBefore(addDelay(item.endTime))
                    && schedule.endTime.isAfter(item.startTime)) ||
                ( addDelay(schedule.endTime).isAfter(item.startTime)
                        && schedule.startTime.isBefore(item.startTime))
                )

        );
    });
}

function getScheduleConfig(){
    return scheduleConfig;
}

module.exports = {list:list, create:create, remove:remove, clear:clear, getNextScheduleDate:getNextScheduleDate,
    fixDateByTimeStep:fixDateByTimeStep, addDelay:addDelay, getScheduleConfig:getScheduleConfig, globalDelay:globalDelay};
