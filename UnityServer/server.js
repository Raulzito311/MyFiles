var app = require('express')();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var shortId = require('shortid');

io.on('connection', function(socket){

    //processa a conexão

    socket.on('CALLBACK_NAME')

});
