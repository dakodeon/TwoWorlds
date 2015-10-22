var publicIp = require('public-ip');
var osc = require('osc-min');
var udp = require('dgram');

var oscEmmiter = udp.createSocket("udp4");

publicIp.v4 (function (err, ip) {
    console.log("My IP is" + ip);
    var msg = {
        address: '/ip',
        args: [ ip ]
    };
    msg = osc.toBuffer(msg);
    oscEmmiter.send(msg, 0, msg.length, 57120, '127.0.0.1');
});
