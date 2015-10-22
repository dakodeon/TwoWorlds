var colors = require('colors');
var express = require('express');
var osc = require('osc-min');
var udp = require("dgram");
var publicIp = require('public-ip');

var config = require("./config.json");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var dns = require('dns');

var oscListener;

var oscEmmiter;

var clientsConnected = 0;

app.use(express.static(__dirname + '/public'));

oscEmmiter = udp.createSocket("udp4");

publicIp.v4(function (err, ip) {
    console.log('My IP is ' + ip);
    // dns.lookup('larigot.avarts.ionio.gr', function onLookup(err, addresses, family) {
        // console.log('Resolving address...');
        // config.osc.address = addresses;
        // console.log('The IP address is ' + config.osc.address);
        var oscMsg = {
            address: '/ip',
            args: [
                ip
            ]
        };
        oscMsg = osc.toBuffer(oscMsg);
        oscEmmiter.send(oscMsg, 0, oscMsg.length, config.osc.port.out, config.osc.address);
    // });
});





oscListener = udp.createSocket("udp4", function(buf, rinfo) {
    
    var msg = osc.fromBuffer(buf);
    
    // *** Sending message to specific tiddly socket if the address is /url
    if (msg.address == "/url") {
	console.log("OSC > Browser: " + msg.address + ": " + msg.args[0].value + " | " + msg.args[1].value);
	if (io.sockets.connected[msg.args[0].value]) {
	    io.sockets.connected[msg.args[0].value].emit('message', msg.args[1].value);
	}
    }

    // *** Change the IP address
    else if (msg.address == "/ip") {
        config.osc.address = msg.args[0].value;
        console.log("The IP changed to: " + config.osc.address);
        var oscReply = {
	    address: '/gotit',
	    args: [
		"Hello, SC"
	    ]
	};
        
        oscReply = osc.toBuffer(oscReply);
        oscEmmiter.send(oscReply, 0, oscReply.length, config.osc.port.out, config.osc.address);
    }
    else if (msg.address == "/gotit") {
        console.log(msg.args[0].value);
    }
});

oscListener.bind(config.osc.port.in);

io.on('connection', function (websocket) {

    // *** post connection info
    console.log("A client just connected: " + websocket.id);
    clientsConnected++;
    io.sockets.emit('users', clientsConnected);

    // *** Receive info from tiddlywiki
    websocket.on('tiddler info', function (msg) {
	console.log(websocket.id + " | " + msg.type + " | " + msg.val + " | " + msg.url);

	// *** Determine if the value of the message refers to keyword or title and send the according message to SC
	if (msg.type == "key") {

	    // *** Make the info a keyword OSC
	    var infosc = {
		address: '/tiddlyKey',
		args: [
		    websocket.id,
		    msg.val,
		    msg.url
		]
	    };
	}
	else if (msg.type == "title") {

	    // *** Make the info a title OSC
	    var infosc = {
		address: '/tiddlyTitle',
		args: [
		    websocket.id,
		    msg.val,
		    msg.url
		]
	    };
	}
	else { console.log("Error: Invalid type!!!"); }
	
	infosc = osc.toBuffer(infosc);
	oscEmmiter.send(infosc, 0, infosc.length, config.osc.port.out, config.osc.address);
    });
    
    websocket.on('osc', function (msg) {
        var buf = osc.toBuffer(msg); // Must add a  real buffer. Check also JSON decoding.
	// io.sockets.emit('message', "Data"); // test tiddly connection
        console.log(colors.blue("Browser > OSC: " + JSON.stringify(msg)));
        oscEmmiter.send(buf, 0, buf.length, config.osc.port.out, config.osc.address);
    });

    websocket.on('disconnect', function () {
        clientsConnected--;
        io.sockets.emit('users', clientsConnected);
    });


});

http.listen(config.http.port.in, function () {
    console.log(colors.rainbow("The Secret School main server: " + config.http.port.in));
});

process.on('exit', function(code) {
    oscListener.close();
    oscEmmiter.close();
    http.close();
    console.log(colors.rainbow("Quitting Secret School"));
});
