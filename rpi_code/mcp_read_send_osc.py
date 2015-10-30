#!/usr/bin/env python

###############################################
# Read data from MCP3004 and send it over OSC #
###############################################

### LIBRARIES

import OSC # OSC library
import spidev # SPI library
import threading # threading library
from time import sleep # sleep function

### OSC CONFIGURATION

# OSC information
addr = "192.168.8.151" # remote address
port = 57120 # remote port
client = OSC.OSCClient()
server = OSC.OSCServer( ('192.168.8.111', 7000) ) # the local address
# add server handlers
server.addDefaultHandlers()

# Start the server
st = threading.Thread( target = server.serve_forever )
st.start()

# Connect to the remote and local server
client.setServer( server )
client.connect( (addr, port) )
print "OSC client connected at " + addr + ", port " + str(port)
print "Sending confirmation message now..."

init = OSC.OSCMessage()
init.setAddress("/confirm")
init.append("I'm connected!")

client.send(init)

### SPI AND SENSORS CONFIGURATION

# Sensor channel on the MCP
chan = [0, 1]

# Establish spi device on bus 0, device 0 (the MCP microchip)
spi = spidev.SpiDev()
spi.open(0,0)

# Sensor range -- change these values according to the sensors stability
lowLimit = 200
highLimit = 960

# Function to read from ADC
def getAdc(channel):
    # Check if it is a valid channel
    if((channel > 3) or (channel < 0)):
        return -1
    # Perform SPI transaction and store returned bits in r
    r = spi.xfer2([1, (8+channel) << 4, 0])
    # Extract the data received in r
    adcOut = ((r[1]&3) << 8) + r[2]
    return adcOut

# Normalize function
def normalize(val, floor, ceil):
    if val < floor:
        val = floor
    elif val > ceil:
        val = ceil

    return val

### MAIN LOOP

cnt = 0

try:
    while True:
        # Read the data from the sensors
        data1 = getAdc(chan[0])
        data2 = getAdc(chan[1])
        #
        # Constrain the readings within stable range
        # data1 = normalize(data1, lowLimit, highLimit)
        # data2 = normalize(data2, lowLimit, highLimit)
        #
        # Post some results (every one second)
        if cnt % 20 == 0:
            print("Channel 1: {0:4d}  ||  Channel 2: {1:4d}".format(data1, data2))
        cnt += 1
        # Send OSC
        msg = OSC.OSCMessage()
        msg.setAddress("/sensors")
        msg.append(data1)
        msg.append(data2)
        client.send(msg)
        # Wait till next loop
        sleep(0.05)

except KeyboardInterrupt:
    print "\nNow quitting..."

finally:
    print "\nClosing OSC server..."
    server.close()
    print "Waiting for sever thread to finish..."
    st.join()
    print "Done!"
