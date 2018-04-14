var scheduleService = require('../services/ScheduleService');
var Schedule = require('../models/schedule');
var moment = require('moment');

describe('Schedule Tests', function() {
    beforeEach(function () {
        scheduleService.clear();
    });
    var timeStep = scheduleService.getScheduleConfig().timeStep;// preventing any exception if the time_step changes
    it('should create schedule', function () {
        var schedule = new Schedule('01/01/2030', timeStep, timeStep*2);
        var res = scheduleService.create(schedule);
        expect(res.scheduleId).not.toBeNull();
        expect(scheduleService.list().length).toBe(1);
    });

    it('should remove schedule', function () {
        var schedule = new Schedule('01/01/2030', timeStep, timeStep*2);
        var res = scheduleService.create(schedule);
        expect(scheduleService.list().length).toBe(1);
        scheduleService.remove(schedule.scheduleId);
        expect(scheduleService.list().length).toBe(0);
    });

    it('should raise an Error when create schedule with start < now', function () {
        var schedule = new Schedule('01/01/2010', timeStep*3, timeStep);
        expect(function () {
            scheduleService.create(schedule);
        }).toThrow(new Error('Order schedule cannot happens in the past'));
    });

    it('should raise an Error when create schedule with start == end', function () {
        var schedule = new Schedule('01/01/2030', timeStep, timeStep);
        expect(function () {
            scheduleService.create(schedule)
        }).toThrow(new Error('Schedule end must superior than the Schedule start'));
    });

    it('should raise an Error when create schedule with start > end', function () {
        var schedule = new Schedule('01/01/2030', timeStep*3, timeStep);
        expect(function () {
            scheduleService.create(schedule);
        }).toThrow(new Error('Schedule end must superior than the Schedule start'));
    });

    it('should create 2 schedules', function () {
        var schedule1 = new Schedule('01/01/2030', timeStep, timeStep*3);
        var minimalStartOfTheSecondSchedule = schedule1.endTime + scheduleService.globalDelay();
        var schedule2 = new Schedule('01/01/2030', minimalStartOfTheSecondSchedule, minimalStartOfTheSecondSchedule + timeStep);
        expect(function () {
            scheduleService.create(schedule1).scheduleId
        }).not.toBeNull();
        expect(function () {
            scheduleService.create(schedule2).scheduleId
        }).not.toBeNull();
    });

    it('should detect overlap when the start of the second schedule is less than the end of the first + globalDelay', function () {
        var day = '01/01/2020';
        var schedule1 = new Schedule(day, timeStep, timeStep*3);
        var minimalStartOfTheSecondSchedule = scheduleService.addDelay(schedule1.endTime);

        minimalStartOfTheSecondSchedule.add(-timeStep, 'minute');
        var minimalStart = minimalStartOfTheSecondSchedule.minutes()+minimalStartOfTheSecondSchedule.hour()*60;
        var schedule2 = new Schedule(minimalStartOfTheSecondSchedule.format('DD/MM/YYYY'),
                minimalStart ,
                minimalStart+timeStep);
        var schedule1Result = scheduleService.create(schedule1);
        expect(function () {
            schedule1Result.scheduleId
        }).not.toBeNull();
        expect(function () {
            scheduleService.create(schedule2);
        }).toThrow(
            new Error('Adding the new schedule failed, overlap detected')
        );
    });

    it('should retreive next schedule when having previous schedule', function () {
        var minimalStart = new moment(scheduleService.fixDateByTimeStep(new Date()));
        var minimalStartMinutes = minimalStart.minutes()+minimalStart.hours()*60;
        var schedule1 = new Schedule(minimalStart.format('DD/MM/YYYY'), minimalStartMinutes, minimalStartMinutes+timeStep*3);

        scheduleService.create(schedule1);
        var nextScheduleDate = scheduleService.getNextScheduleDate();

        var expectedResult = scheduleService.addDelay(schedule1.endTime).toDate();
        expect(nextScheduleDate.getTime()).toBe(expectedResult.getTime());
    });

})