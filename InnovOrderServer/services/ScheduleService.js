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
    if (schedule.startTime.toDate().getTime() >= schedule.endTime.toDate().getTime())
        throw new Error('Schedule end must superior than the Schedule start');
    if (schedule.start%scheduleConfig.timeStep!=0 || schedule.end%scheduleConfig.timeStep!=0)
        throw new Error('Schedule start or end must be multiple of '+scheduleConfig.timeStep);
    var overlapItems = findOverlapItems(schedule);
    if (overlapItems.length>0)
        throw new Error('Adding the new schedule failed, overlap detected');
    schedules.push(schedule);
    schedules.sort(function compare(a, b){
        var comparison = 0;
        if (a.startTime.toDate().getTime() > b.startTime.toDate().getTime()) {
            comparison = 1;
        } else if (b.startTime.toDate().getTime() > a.startTime.toDate().getTime()) {
            comparison = -1;
        }
        return comparison;
    });
    return schedules[schedules.length-1];
}

function getNextScheduleDate() {
    if (!schedules.length){
        return fixDateByTimeStep(new Date());
    } else {
        for (i in schedules) {
            var schedule = schedules[i];
            var minimalStart = addDelay(schedule.endTime);
            console.log('\n'+schedule.endTime.toDate());
            console.log(minimalStart.toDate());
            var minimalEnd = new moment(minimalStart.toDate());
            minimalEnd.add(scheduleConfig.timeStep, 'minute');
            console.log('minimalEnd '+minimalEnd.toDate());

            var possibleSchedule = new Schedule(minimalStart.format('DD/MM/YYYY'), minimalStart.minutes()+minimalStart.hour()*60, minimalEnd.minutes()+minimalEnd.hour()*60);
            console.log('possibleSchedule.startTime '+possibleSchedule.startTime.toDate());
            var overlaps = findOverlapItems(possibleSchedule);
            if (!overlaps.length){
                console.log(minimalStart.toDate());
                return minimalStart.toDate();
            }
        }
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
        return  (item.day == schedule.day && schedule.startTime.toDate().getTime() < addDelay(item.endTime).toDate().getTime()
        && addDelay(schedule.endTime).toDate().getTime()>item.startTime.toDate().getTime()
        );
    });
}

function getScheduleConfig(){
    return scheduleConfig;
}

module.exports = {list:list, create:create, remove:remove, clear:clear, getNextScheduleDate:getNextScheduleDate,
    fixDateByTimeStep:fixDateByTimeStep, addDelay:addDelay, getScheduleConfig:getScheduleConfig, globalDelay:globalDelay};
