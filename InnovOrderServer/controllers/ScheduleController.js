/**
 * ScheduleController.js
 *
 * Handle Schedule requests.
 */
 var moment = require('moment');
 var util = require('util');
 var express = require('express');
 var scheduleService = require('../services/ScheduleService');
 var Schedule = require('../models/Schedule');
 var baseUrl = '/api/schedules';
 /** Router setup **/

 var router = express.Router();

 /* Create Schedule : POST http://localhost:3000/api/schedules/create */
 router.post(baseUrl, function(req, res, next) {
    try{
        var newItem = scheduleService.create( new Schedule(req.body.day, req.body.start, req.body.end) );
    }catch (e) {
        res.status(400).send(e.message);
        return;
    }
     try{
        res.status(201).send({scheduleId:newItem.scheduleId});
     }catch (e) {
         console.log(e);
     }
 });

 /* Listing Schedules : GET http://localhost:3000/api/schedules/list */
 router.get(baseUrl, function(req, res, next) {
     return res.json(scheduleService.list());
 });

 /* Get the server config : GET http://localhost:3000/api/schedules/config */
 router.get(`${baseUrl}/config`, function(req, res, next) {
    return res.json(scheduleService.getScheduleConfig());
 });

 /* Get the next schedule date : GET http://localhost:3000/api/schedules/nextScheduleDate:afterScheduleStartDate */
 router.get(`${baseUrl}/nextScheduleDate/:afterScheduleStartDate`, function(req, res, next) {
     return res.json(scheduleService.getNextScheduleDate(new moment(req.params.afterScheduleStartDate, 'DD/MM/YYYY HH:mm')));
 });

 /* Delete Schedule : DELETE http://localhost:3000/api/schedules/:id */
 router.delete(`${baseUrl}/:id`, function(req, res, next) {
    try{
        scheduleService.remove( req.params.id );
    }catch (e) {
        res.status(400).send(e.message);
        return;
    }
     res.send({message:'Schedule removed'});
 });

 module.exports = router;