/*jshint node:true*/

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var auth  = require('http-auth');

var cfenv = require('cfenv');

// create a new express server
var app = express();

/* authentication (basic) */
var basic = auth.basic({
  realm: "Cognitive Factory"
}, function (username, password, callback) { // Custom authentication method.
  callback(username === "coguser" && password === "GGZxBeMqhiiJMbd7ga");
}
);
app.use(auth.connect(basic));


// serve the files out of ./public as our main files
// app.use(express.static(__dirname + '/apps/main/dist'));
// update upload size limit
// app.use(bodyParser.json({limit: '1mb'}));
app.use(express.static(__dirname + '/apps/main/dist'));  // get /public directory
//app.use(express.static(__dirname + '/apps/main/src'));  // get /public directory
app.use('/assets/video', express.static(__dirname + '/video')); // for video
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(bodyParser.json());

// to access following pages, login required
app.use(require(__dirname + '/server/controllers/root')().getRoute());
app.use(require(__dirname + '/server/controllers/assessmentCtrl')().getRoute());
app.use(require(__dirname + '/server/controllers/vrCtrl')().getRoute());

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);
