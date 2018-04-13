import {Component, NgZone} from '@angular/core';
import {ScheduleService} from './schedule.service';
import {Observable} from "rxjs/Observable";
import * as moment from "moment";
import {animate, state, style, transition, trigger} from "@angular/animations";
var animtionDelay = 215;
@Component({
  selector: 'app-root',
  templateUrl: './app.schedule.html',
  styleUrls: ['./app.schedule.css'],
  animations: [
    trigger("changeBodyColor",[
      transition('off => on', animate(animtionDelay, style({backgroundColor: '#00FFFF'}))),
      transition('on => off', animate(animtionDelay, style({backgroundColor: '#FFFFFF'})))
    ])
  ]
})
export class AppSchedule {
  public nextSchedule: Date;

  public orderDuration: number;
  public scheduleConfig:any;
  public orderDurationItems = new Array(0);
  public schedules;
  public message: string;
  public colorStateNextSchedule='off';
  constructor(private scheduleService: ScheduleService, private _ngZone: NgZone) {
    this.loadConfig().subscribe(
      data =>{
          this.scheduleConfig = data;
          this.fillOrderDurationItems();
          this.loadSchedules();
        },
      exp =>{this.message = exp.error;}
      );
    this.updateNextScheduleDate();
  }

  onSchedule() {
    this.clearMessage();
    var mnt = moment(this.nextSchedule.getTime());
    var start = mnt.minutes()+mnt.hours()*60;
    var end = start + this.orderDuration;
    var dayStr = mnt.format('DD/MM/YYYY');
    this.scheduleService.create(dayStr, start, end).subscribe(
      data =>{
            this.loadSchedules();
            this.updateNextScheduleDate();
      },
      exp =>{
        this.message = exp.error;
        this.updateNextScheduleDate();//case old schedule date
      }
    );
  }
  removeSchedule(id:string) {
    this.clearMessage();
    this.scheduleService.delete(id).subscribe(
      data =>{
        this.loadSchedules();
        this.updateNextScheduleDate();
      }
    );
  }
  private updateNextScheduleDate():any {

     this.scheduleService.nextScheduleDate().subscribe(
       data =>{
           var newDate = moment(data, 'DD/MM/YYYY HH:mm').toDate();
           if (!this.nextSchedule || this.nextSchedule.getTime() != newDate.getTime()) {
             this.nextSchedule = newDate;
             this.blickNextScheduleInput();
           }
         },
       exp =>{this.message = exp.error;}
     );
  }
  private blickNextScheduleInput(){
    this.colorStateNextSchedule = 'on';
    setTimeout(()=>{this.colorStateNextSchedule = 'off';}, animtionDelay);
  }
  public loadConfig(): Observable<{}>{
      return this.scheduleService.getConfig();
  }
  public fillOrderDurationItems() {
    var timeStep = this.scheduleConfig.timeStep;
    for (var i=1; i<=4; i++) {
      this.orderDurationItems.push(timeStep*i);
    }
    this.orderDuration = timeStep;
  }

  public loadSchedules(){
    this.scheduleService.list().subscribe(
      data => {
          for(var k in data){
            data[k].startTime = new Date(data[k].startTime);
            data[k].endTime = new Date(data[k].endTime);
          }
          this.schedules = data
        },
      exp =>{this.message = exp.error;}
      );
  }
  private clearMessage(){
    this.message = '';
  }
}
