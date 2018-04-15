function ScheduleConfig(timeStep, preparationDelay, rushDelay, maxOrderDurationIninutes) {
    this.timeStep = timeStep || 15;
    this.preparationDelay = preparationDelay || 20;
    this.rushDelay = rushDelay || 10;
    this.maxOrderDurationIninutes = maxOrderDurationIninutes || 60;
}
var scheduleConfig = new ScheduleConfig();
module.exports = scheduleConfig;