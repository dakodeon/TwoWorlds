var dns = require('dns');
var externalip = require('externalip');

dns.resolve4('larigot.avarts.ionio.gr', function (err, addresses) {
    if (err) throw err;

    console.log('addresses: ' + JSON.stringify(addresses));
    
    addresses.forEach(function (a) {
        dns.reverse(a, function (err, hostnames) {
            if (err) {
                throw err;
            }

            console.log('reverse for ' + a + ': ' + JSON.stringify(hostnames));
        });
    });
});

dns.lookup('larigot.avarts.ionio.gr', function onLookup(err, addresses, family) {
    console.log('addressesssss:', addresses);
});

externalip(function (err, ip) {
    console.log('And myIP is ' + ip); // => 8.8.8.8
});
