var express = require("express");
var request = require('request');

var app = express();
app.use(express.static(__dirname + "/../www"));

var host = "0.0.0.0";
var port = 8000;
app.listen(port, host);
console.log("###############################");
console.log("servidor de testes iniciado em:");
console.log("http://" + host + ":" + port);
console.log("###############################");
