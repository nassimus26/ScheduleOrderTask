/**
 * app.js
 *
 * Main execution file for this project.
 */

/** External modules **/
var express = require('express');

/** Internal modules **/
var scheduleController = require('./controllers/ScheduleController');
var bodyParser = require("body-parser");

/** Express setup **/
var app = express();

/** bodyParser.urlencoded(options)
* Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
* and exposes the resulting object (containing the keys and values) on req.body
*/
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

app.set('trust proxy',1);
// trust first proxy
app.set('json spaces',4);

/** Express routing **/

app.use('/', scheduleController);

app.all('*', function (req, res){
    res.status(403).send('403 - Forbidden');
})
var port = 3000;
/** Server deployment **/
app.listen(port);

console.log('\n--- Innov Order Server is running on '+port+' ---');

