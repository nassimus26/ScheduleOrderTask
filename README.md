# ScheduleOrderTask

# Installing the app

* Clone the repo by using ```git clone```.
* Run ```npm install``` on both folders `InnovOrderServer` and `InnovOrderWebapp`.

## Running unit tests on the server

Run `npm test` on the `InnovOrderServer` folder to execute the unit tests via [Karma](https://karma-runner.github.io).

# Running the app

* Run ```npm start``` on both folders `InnovOrderServer` and `InnovOrderWebapp`.

# Server API Endpoints

```
Listing Schedules : GET http://localhost:3000/api/schedules/list
Create Schedule : POST http://localhost:3000/api/schedules/create
Delete Schedule : DELETE http://localhost:3000/api/schedules/:id
Get the next schedule date : GET http://localhost:3000/api/schedules/nextScheduleDate
Get the server config : GET http://localhost:3000/api/schedules/config
```
# App Preview
![Webapp screen shoot](http://oi67.tinypic.com/mmzr7q.jpg)
