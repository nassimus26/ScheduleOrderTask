function ScheduleConfig(timeStep, preparationDelay, rushDelay) {
    this.timeStep = timeStep || 15;
    this.preparationDelay = preparationDelay || 20;
    this.rushDelay = rushDelay || 10;
}
var scheduleConfig = new ScheduleConfig();
module.exports = scheduleConfig;