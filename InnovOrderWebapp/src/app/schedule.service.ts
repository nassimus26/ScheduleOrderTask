import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs/Observable";
import { HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable()
export class ScheduleService {
    private schedulesUrl = '/api/schedules';
    constructor(private http: HttpClient) {

    }
  /** CREATE: create the schedule on the server */
    create(day:string, start:number, end:number): Observable<{}> {
      return this.http.post(this.schedulesUrl, {
        day: day,
        start: start,
        end: end
      });
    }

  /** DELETE: delete the schedule from the server */
  delete (id: string): Observable<{}> {
    const url = `${this.schedulesUrl}/${id}`;
    return this.http.delete(url, httpOptions);
  }

  /** LIST: list the schedules from the server */
  list (): Observable<{}> {
    return this.http.get(this.schedulesUrl, httpOptions);
  }
  /** Next Schedule: find next schedule from the server */
  getConfig (): Observable<{}> {
    const url = `${this.schedulesUrl}/config`;
    return this.http.get(url, httpOptions);
  }

  /** Next Schedule: find next schedule from the server */
  nextScheduleDate (fromDate:string): Observable<{}> {
    const url = `${this.schedulesUrl}/nextScheduleDate/${fromDate}`;
    return this.http.get(url, httpOptions);
  }
}
