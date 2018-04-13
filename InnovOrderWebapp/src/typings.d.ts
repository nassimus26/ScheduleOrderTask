/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface Schedule {
  scheduleId :string;
  day : number;
  start : number;
  end : number;
  startTime : string;
  endTime : string;
}
interface ScheduleConfig {
  timeStep : number;
  preparationDelay : number;
  rushDelay : number;
}
