# Innov Order RESTFUL api

# Installation

* Run ```npm install```.
* Edit the `config/ScheduleConfig.js` file to suit your needs.

## Running unit tests

Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

# Running the server

* ```npm start```.

# API Endpoints

```
Listing Schedules : GET http://localhost:3000/api/schedules/list
Create Schedule : POST http://localhost:3000/api/schedules/create
Delete Schedule : DELETE http://localhost:3000/api/schedules/:id
Get the next schedule date : GET http://localhost:3000/api/schedules/nextScheduleDate:afterScheduleStartDate
Get the server config : GET http://localhost:3000/api/schedules/config
```
