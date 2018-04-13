var scheduleService = require('../services/ScheduleService');
var Schedule = require('../models/schedule');
var moment = require('moment');

describe('Schedule Tests', function() {
    beforeEach(function () {
        scheduleService.clear();
    });
    var timeStep = scheduleService.getScheduleConfig().timeStep;// preventing any exception if the time_step changes
    it('should create schedule', function () {
        var schedule = new Schedule('01/01/2010', timeStep, timeStep*2);
        var res = scheduleService.create(schedule);
        expect(res.scheduleId).not.toBeNull();
        expect(scheduleService.list().length).toBe(1);
    });

    it('should remove schedule', function () {
        var schedule = new Schedule('01/01/2010', timeStep, timeStep*2);
        var res = scheduleService.create(schedule);
        expect(scheduleService.list().length).toBe(1);
        scheduleService.remove(schedule.scheduleId);
        expect(scheduleService.list().length).toBe(0);
    });

    it('should fail to create schedule when start == end', function () {
        var schedule = new Schedule('01/01/2010', timeStep, timeStep);
        expect(function () {
            scheduleService.create(schedule)
        }).toThrow(new Error('Schedule end must superior than the Schedule start'));
    });

    it('should fail to create schedule when start > end', function () {
        var schedule = new Schedule('01/01/2010', timeStep*3, timeStep);
        expect(function () {
            scheduleService.create(schedule)
        }).toThrow(new Error('Schedule end must superior than the Schedule start'));
    });

    it('should create 2 schedules', function () {
        var schedule1 = new Schedule('01/01/2010', timeStep, timeStep*3);
        var minimalStartOfTheSecondSchedule = schedule1.endTime + scheduleService.globalDelay();
        var schedule2 = new Schedule('01/01/2010', minimalStartOfTheSecondSchedule, minimalStartOfTheSecondSchedule + timeStep);
        expect(function () {
            scheduleService.create(schedule1).scheduleId
        }).not.toBeNull();
        expect(function () {
            scheduleService.create(schedule2).scheduleId
        }).not.toBeNull();
    });

    it('should detect overlap when the start of the second schedule is less than the end of first + globalDelay', function () {
        var day = '01/01/2011';
        var schedule1 = new Schedule(day, timeStep, timeStep*3);
        var minimalStartOfTheSecondSchedule = schedule1.end + scheduleService.globalDelay();
        minimalStartOfTheSecondSchedule -= scheduleService.time_step;
        var schedule2 = new Schedule(day, minimalStartOfTheSecondSchedule, minimalStartOfTheSecondSchedule + timeStep);
        var schedule1Result = scheduleService.create(schedule1);
        expect(function () {
            schedule1Result.scheduleId
        }).not.toBeNull();

        expect(function () {
            scheduleService.create(schedule2)
        }).toThrow(
            new Error('Adding the new schedule failed, overlap detected')
        );
    });

    it('should retreive next schedule when no previous schedule (no need for the delay)', function () {
        var schedule1 = new Schedule('01/01/2010', timeStep, timeStep*3);
        scheduleService.create(schedule1);
        var nextScheduleDate = scheduleService.getNextScheduleDate();
        var expetedResult = scheduleService.fixDateByTimeStep(new Date());
        expect(nextScheduleDate.getTime()).toBe(expetedResult.getTime());
    });

    it('should retreive next schedule when having previous schedule', function () {
        var schedule1 = new Schedule(scheduleService.fixDateByTimeStep(new moment().add('2', 'day').toDate()), timeStep, timeStep*3);

        scheduleService.create(schedule1);
        var nextScheduleDate = scheduleService.getNextScheduleDate();

        var expetedResult = scheduleService.addDelay(schedule1.endTime).toDate();
/*        console.log(schedule1.startTime.toDate());
        console.log(schedule1.endTime.toDate());
        console.log(nextScheduleDate);
        console.log(expetedResult);*/
        expect(nextScheduleDate.getTime()).toBe(expetedResult.getTime());
    });
})