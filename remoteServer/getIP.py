import ipgetter
import time

ip = myIP = ipgetter.myip()
cnt = 1

timeInt = 3

print "My IP is " + myIP


while True:
    ip = ipgetter.myip()
    if ip != myIP:
        myIP = ip
        print("{0}: The IP changed to {1}".format(cnt, myIP))
    else:
        print("{0}: Still the same!".format(cnt))
        
    time.sleep(3)
    cnt += 1
