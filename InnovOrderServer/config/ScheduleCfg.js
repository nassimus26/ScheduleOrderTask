function ScheduleConfig(timeStep, preparationDelay, rushDelay, maxOrderDurationInMinutes) {
    this.timeStep = timeStep || 15;
    this.preparationDelay = preparationDelay || 20;
    this.rushDelay = rushDelay || 10;
    this.maxOrderDurationInMinutes = maxOrderDurationInMinutes || 60;
}
var scheduleConfig = new ScheduleConfig();
module.exports = scheduleConfig;