"use strict";

var staticServer = require('node-static'),
    auth = require("http-auth"),
    fileServer = new staticServer.Server('../public'),
    basic,
    width,
	  height,
    socketServer,
    STREAM_SECRET,
    STREAM_PORT,
    WEBSOCKET_PORT,
    STREAM_MAGIC_BYTES;

if( process.argv.length < 3 ) {
  console.log(
    'Usage: \n' +
    'node stream-server.js <secret> [<stream-port> <websocket-port>]'
  );
  process.exit();
}

  STREAM_SECRET = process.argv[2];
	STREAM_PORT = process.argv[3] || 8082;
	WEBSOCKET_PORT = process.argv[4] || 8084;
	STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

  width = 320;
	height = 240;

// Websocket Server
socketServer = new (require('ws').Server)({port: WEBSOCKET_PORT});

socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);
	socket.send(streamHeader, {binary:true});

	console.log( 'New WebSocket Connection ('+socketServer.clients.length+' total)' );

	socket.on('close', function(){
		console.log( 'Disconnected WebSocket ('+socketServer.clients.length+' total)' );
	});
});

socketServer.broadcast = function(data, opts) {
	for( var i in this.clients ) {
		this.clients[i].send(data, opts);
	}
};


// HTTP Server to accept incomming MPEG Stream
require('http').createServer( function(request, response) {
	var params = request.url.substr(1).split('/');

	width = (params[1] || 320)|0;
	height = (params[2] || 240)|0;

	if( params[0] === STREAM_SECRET ) {
		console.log(
			'Stream Connected: ' + request.socket.remoteAddress +
			':' + request.socket.remotePort + ' size: ' + width + 'x' + height
		);
		request.on('data', function(data){
			socketServer.broadcast(data, {binary:true});
		});
	}
	else {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress +
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}

}).listen(STREAM_PORT);

basic = auth.basic({
  realm: "Private area",
  file: __dirname + "/htpasswd"
});

require('http').createServer(basic, function(request, response) {
  request.addListener('end', function() {
    fileServer.serve(request,response);
  }).resume();
}).listen(8080);

console.log('Listening for MPEG Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>/<width>/<height>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
