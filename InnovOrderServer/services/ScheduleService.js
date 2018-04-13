/**
 * ScheduleService.js
 *
 * Support basic Add/Remove/list Schedule.
 * Instead of using DataBase we use a simple Array
 */

require('../models/Schedule');
var scheduleConfig = require('../config/ScheduleCfg');
var moment = require('moment');
var schedules = [];

function list(){
    return schedules;
}

function create(schedule) {
    if (schedule.startTime.toDate().getTime() >= schedule.endTime.toDate().getTime())
        throw new Error('Schedule end must superior than the Schedule start');
    if (schedule.start%scheduleConfig.timeStep!=0 || schedule.end%scheduleConfig.timeStep!=0)
        throw new Error('Schedule start or end must be multiple of '+scheduleConfig.timeStep);
    var overlapItems = findOverlapItems(schedule);
    if (overlapItems.length>0)
        throw new Error('Adding the new schedule failed, overlap detected');
    schedules.push(schedule);
    return schedules[schedules.length-1];
}

function getNextScheduleDate() {
    if (!schedules.length){
        return fixDateByTimeStep(new Date());
    }else {
        var schedule = schedules[schedules.length-1];
        var minimalStartSchedule = addDelay(schedule.endTime);
        if (minimalStartSchedule.toDate().getTime()> new Date().getTime())
            return minimalStartSchedule.toDate();
        return fixDateByTimeStep(new Date());
    }
}

function fixDateByTimeStep(date){
    var mnt = new moment(date);
    var mintues = mnt.get('minute');
    var mintuesFloor = Math.floor(mintues/scheduleConfig.timeStep)*scheduleConfig.timeStep;
    if (mintuesFloor<mintues)
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

function addDelay(date, delayInMinutes) {
    return new moment(date.toDate()).add(globalDelay(), 'minute');
}

function findOverlapItems(schedule){
    return schedules.filter( function(item) {
        return  (item.day == schedule.day && schedule.startTime.toDate().getTime() < addDelay(item.endTime).toDate().getTime());
    });
}

function getScheduleConfig(){
    return scheduleConfig;
}

module.exports = {list:list, create:create, remove:remove, clear:clear, getNextScheduleDate:getNextScheduleDate,
    fixDateByTimeStep:fixDateByTimeStep, addDelay:addDelay, getScheduleConfig:getScheduleConfig, globalDelay:globalDelay};