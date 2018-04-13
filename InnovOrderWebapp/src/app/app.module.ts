import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ScheduleService } from './schedule.service';

import { AppSchedule } from './app.schedule';
import {FormsModule} from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


@NgModule({
  declarations: [
    AppSchedule
  ],
  imports: [
    BrowserModule, FormsModule, HttpClientModule, BrowserAnimationsModule
  ],
  providers: [
    ScheduleService
  ],
  bootstrap: [AppSchedule]
})
export class AppModule { }
