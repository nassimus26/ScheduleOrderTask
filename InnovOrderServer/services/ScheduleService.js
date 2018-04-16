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
function dateToSchedule(date, duration){
    var nowStart = minutesOfTheDay(date);
    return new Schedule(date.format('DD/MM/YYYY'), nowStart, nowStart+duration);
}
function getNextScheduleDate(fromScheduleStartDate) {
    var now = new moment(fixDateByTimeStep(new Date()));
    now = removeDelay(now);
    now.add(-scheduleConfig.timeStep, 'minute');
    var fakeFirstSchedule = dateToSchedule(now, scheduleConfig.timeStep);
    var schedules_ = [fakeFirstSchedule,...schedules];
    for (i in schedules_) {
        var schedule = schedules_[i];
        if (fromScheduleStartDate && addDelay(schedule.endTime).isSameOrBefore(fromScheduleStartDate))
                continue;
        var minimalStartDate = addDelay(schedule.endTime);
        var minimalStart = minutesOfTheDay(minimalStartDate);
        var maxOrderDuration = 0;
        while (maxOrderDuration<scheduleConfig.maxOrderDurationIninutes){
            var newMaxDuration = maxOrderDuration+scheduleConfig.timeStep;
            if (!isPossibleSchedule(schedules_, minimalStartDate, minimalStart, minimalStart+newMaxDuration))
                break;
            maxOrderDuration = newMaxDuration;
        }
        if (maxOrderDuration>0)
            return {
                nextScheduleDate : minimalStartDate.format('DD/MM/YYYY HH:mm'),
                maxOrderDuration : maxOrderDuration
            };
    }
    if (fromScheduleStartDate>new Date()){
        var nextSchedule = fromScheduleStartDate.add(scheduleConfig.timeStep, 'minute');
        return {
            nextScheduleDate : moment(fixDateByTimeStep(nextSchedule.toDate())).format('DD/MM/YYYY HH:mm'),
            maxOrderDuration : scheduleConfig.maxOrderDurationIninutes
        };
    }
}
function isPossibleSchedule(schedules_, moment_,start, end){
    var possibleSchedule = new Schedule(moment_.format('DD/MM/YYYY'), start, end);
    var overlaps = findOverlapItems(possibleSchedule, schedules_);
    return (!overlaps.length);
}
function minutesOfTheDay(moment_){
    return moment_.minutes()+moment_.hours()*60;
}
function fixDateByTimeStep(date){
    var mnt = new moment(date);
    var mintues = mnt.get('minute');
    var nbrStep = Math.floor(mintues/scheduleConfig.timeStep);
    var mintuesFloor = nbrStep*scheduleConfig.timeStep;
    if (mintuesFloor<mintues || (mnt.isSameOrBefore(new moment())))
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
function removeDelay(date) {
    return new moment(date.toDate()).add(-globalDelay(), 'minute');
}

function findOverlapItems(schedule, schedules_){
    var schedules__ = schedules_?schedules_:schedules;
    return schedules__.filter( function(item) {
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

module.exports = {list:list, create:create, remove:remove, clear:clear, getNextScheduleDate:getNextScheduleDate,minutesOfTheDay:minutesOfTheDay,
    fixDateByTimeStep:fixDateByTimeStep, addDelay:addDelay, removeDelay:removeDelay, getScheduleConfig:getScheduleConfig, globalDelay:globalDelay};
