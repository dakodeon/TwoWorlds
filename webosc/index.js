var colors = require('colors');
var express = require('express');
var osc = require('osc-min');
var udp = require("dgram");
var jfile = require("jsonfile");

var config = require("./config.json");
var twData = config.data;

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var oscListener;

var oscEmmiter;

var clientsConnected = 0;

app.use(express.static(__dirname + '/public'));

// *** Create the OSC emmiter
oscEmmiter = udp.createSocket("udp4");

// *** Create the OSC listener
oscListener = udp.createSocket("udp4", function(buf, rinfo) {
    
    var msg = osc.fromBuffer(buf);
    
    // *** Sending message to specific tiddly socket if the address is /url
    if (msg.address == "/url") {
	console.log("OSC > Browser: " + msg.address + ": " + msg.args[0].value + " | " + msg.args[1].value);
	if (io.sockets.connected[msg.args[0].value]) {
	    io.sockets.connected[msg.args[0].value].emit('message', msg.args[1].value);
	}
    }

    // *** Write to .JSON file --- SWITCH TO WEBSOCKET
    else if (msg.address == "/writefile") {
        var time = new Date().getTime();
        twData.entries.unshift({ "timestamp":time, "sound":msg.args[0].value, "key":msg.args[1].value });
        
        jfile.writeFile("output_file.json", twData, function (err) {
            console.error(err);
        });
        console.log("Updated test.json");
    }
    // *** Change the IP address
    else if (msg.address == "/ip") {
        config.osc.address = msg.args[0].value;
        console.log("The IP changed to: " + config.osc.address);
        var oscReply = {
	    address: '/ip_changed',
	    args: [
		"Hello, SC"
	    ]
	};
        
        oscReply = osc.toBuffer(oscReply);
        oscEmmiter.send(oscReply, 0, oscReply.length, config.osc.port.out, config.osc.address);
    }
});

oscListener.bind(config.osc.port.in);

// *** When there is a user connection, start receiving from Socket.io
io.on('connection', function (websocket) {

    // *** post connection info
    console.log("A client just connected: " + websocket.id);
    clientsConnected++;
    io.sockets.emit('users', clientsConnected);

    // *** Receive a sound name from tiddlywiki
    websocket.on('sound name', function (msg) {
        // *** Print out the received data
	console.log(websocket.id + " | " + msg.val);

        // *** Make OSC
        var infosc = {
            address: '/sound_name',
            args: [
                websocket.id,
                msg.val
            ]
        };

        // *** Send OSC
	infosc = osc.toBuffer(infosc);
	oscEmmiter.send(infosc, 0, infosc.length, config.osc.port.out, config.osc.address);
    });

    // *** I don't think this is used anywhere, just keeping it to be sure
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
    console.log(colors.rainbow("Two Worlds main server: " + config.http.port.in));
});

process.on('exit', function(code) {
    oscListener.close();
    oscEmmiter.close();
    http.close();
    console.log(colors.rainbow("Quitting Two Worlds server"));
});
