#!/usr/bin/env python

########################################
# Check if the external IP is changed. #
# If it is, send an OSC message.       #
########################################

import OSC
import ipgetter
import time

client = OSC.OSCClient()
client.connect( ('127.0.0.1', 57120) ) # Connecting to local SuperCollider

ip = myIP = ipgetter.myip()

timeInt = 3

print "My IP is " + myIP


while True:
    start = time.time()
    ip = ipgetter.myip()
    if ip != myIP:
        # check again
        if ip != myIP:
            print "Check again..."
            myIP = ip
            print "The IP changed to " + myIP
            msg = OSC.OSCMessage()
            msg.setAddress("/ip")
            msg.append(myIP)
            client.send(msg)
    
    # Wait some time
    print "Here, debugger: " + myIP + " || time: " + str(time.time() - start)
    time.sleep(timeInt)

