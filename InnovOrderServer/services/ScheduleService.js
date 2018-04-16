/**
 * ScheduleService.js
 *
 * Support basic Add/Remove/list Schedule.
 * Instead of using DataBase we use a simple Array
 */

require('../models/Schedule');
var scheduleConfig = require('../config/ScheduleCfg');
var Schedule = require('../models/Schedule');
var NextScheduleDateResponse = require('../models/NextScheduleDateResponse');
var moment = require('moment');

class ScheduleService {
    constructor(name){
        this.schedules = [];
    }

    list(){
        return this.schedules;
    }

    create(schedule) {
        if (schedule.startTime.isBefore(new moment()))
            throw new Error('Order schedule cannot happens in the past');
        if (schedule.startTime.isSameOrAfter(schedule.endTime))
            throw new Error('Schedule end must superior than the Schedule start');
        if (schedule.start%scheduleConfig.timeStep!=0 || schedule.end%scheduleConfig.timeStep!=0)
            throw new Error('Schedule start or end must be multiple of '+scheduleConfig.timeStep);
        var overlapItems = this.findOverlapItems(schedule);
        if (overlapItems.length>0)
            throw new Error('Adding the new schedule failed, overlap detected');
        this.schedules.push(schedule);
        this.sortSchedulesByDate();
        return this.lastSchedule();
    }
    lastSchedule(){
        return this.schedules[this.schedules.length-1];
    }
    sortSchedulesByDate(){
        this.schedules.sort(function compare(a, b){
            var c = a.startTime.toDate().getTime() - b.startTime.toDate().getTime();
            return c===0?0:c/Math.abs(c);
        });
    }

    dateToSchedule(date, duration){
        var nowStart = this.minutesOfTheDay(date);
        return new Schedule(date.format('DD/MM/YYYY'), nowStart, nowStart+duration);
    }

    getNextScheduleDate(afterScheduleStartDate) {
        /*
         @STEP 1
         * We add a fake schedule with endTime is now -scheduleConfig.timeStep
         * to offer a chance that the next schedule will be just after now
         * */
        var now = new moment(this.fixDateByTimeStep(new Date()));
        now = this.removeDelay(now);
        now.add(-scheduleConfig.timeStep, 'minute');
        var fakeFirstSchedule = this.dateToSchedule(now, scheduleConfig.timeStep);
        var schedules_ = [fakeFirstSchedule,...this.schedules];
        /********************* End of @STEP 1 ***********************/
        for (var i in schedules_) {
            var schedule = schedules_[i];
            // handle next schedule date behavior with fromScheduleStartDate argument
            if (afterScheduleStartDate && this.addDelay(schedule.endTime).isSameOrBefore(afterScheduleStartDate))
                continue;
            var minimalStartDate = this.addDelay(schedule.endTime);
            var minimalStart = this.minutesOfTheDay(minimalStartDate);
            var maxOrderDuration = 0;
            while (maxOrderDuration<scheduleConfig.maxOrderDurationInMinutes){
                var newMaxDuration = maxOrderDuration+scheduleConfig.timeStep;
                if (!this.isPossibleSchedule(schedules_, minimalStartDate, minimalStart, minimalStart+newMaxDuration))
                    break;
                maxOrderDuration = newMaxDuration;
            }
            if (maxOrderDuration>0)
                return new NextScheduleDateResponse(minimalStartDate, maxOrderDuration);
        }
        // we are now after all schedules let increment by scheduleConfig.timeStep
        if (afterScheduleStartDate>new Date()) {
            var nextSchedule = afterScheduleStartDate.add(scheduleConfig.timeStep, 'minute');
            return new NextScheduleDateResponse(moment(this.fixDateByTimeStep(nextSchedule.toDate())), scheduleConfig.maxOrderDurationInMinutes);
        }
    }

    isPossibleSchedule(schedules_, moment_,start, end){
        var possibleSchedule = new Schedule(moment_.format('DD/MM/YYYY'), start, end);
        var overlaps = this.findOverlapItems(possibleSchedule, schedules_);
        return (!overlaps.length);
    }

    minutesOfTheDay(moment_){
        return moment_.minutes()+moment_.hours()*60;
    }

    fixDateByTimeStep(date){
        var mnt = new moment(date);
        var mintues = mnt.get('minute');
        var nbrStep = Math.floor(mintues/scheduleConfig.timeStep);
        var mintuesFloor = nbrStep*scheduleConfig.timeStep;
        if (mintuesFloor<mintues || (mnt.isSameOrBefore(new moment())))
            mintuesFloor +=scheduleConfig.timeStep;
        mnt.minute(mintuesFloor);
        return mnt.toDate();
    }

    remove(scheduleId){
        this.schedules = this.schedules.filter( function(item) {
            return !(item.scheduleId == scheduleId);
        });
        return this.schedules;
    }

    globalDelay (){
        var delay = scheduleConfig.preparationDelay + scheduleConfig.rushDelay;
        var nbr_step = Math.floor(delay/scheduleConfig.timeStep);
        if (nbr_step*scheduleConfig.timeStep <delay )
            delay = (nbr_step+1)*scheduleConfig.timeStep;
        return delay;
    }

    clear(){
        this.schedules = [];
    }

    addDelay(date) {
        return new moment(date.toDate()).add(this.globalDelay(), 'minute');
    }

    removeDelay(date) {
        return new moment(date.toDate()).add(-this.globalDelay(), 'minute');
    }

    findOverlapItems(schedule, schedules_){
        var schedules__ = schedules_?schedules_:this.schedules;
        var $this = this;
        return schedules__.filter( function(item) {
            return  (item.day == schedule.day && (
                    ( schedule.startTime.isBefore($this.addDelay(item.endTime))
                    && schedule.endTime.isAfter(item.startTime)) ||
                    ( $this.addDelay(schedule.endTime).isAfter(item.startTime)
                    && schedule.startTime.isBefore(item.startTime))
                )

            );
        });
    }

    getScheduleConfig (){
        return scheduleConfig;
    }

}

module.exports = new ScheduleService();
