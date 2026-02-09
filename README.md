This check is based on the "Latency Test" from https://proxydetect.live/: "This test compares incoming TCP/IP latencies to WebSocket latencies initiated via JavaScript on the client side. If the WebSocket latency is significantly higher than the TCP/IP latency, then it is likely a Proxy or VPN connection."

`server.js` - is a WS and HTTP server. Measures TCP RTT for incoming connections.
`client.js` - is a client. Measures the TCP RTT and WS RTT.

Example 1 - PL client to DE server, no VPN:
```
$node client.js
Testing 130.61.179.106:80

Client TCP RTT: 36.53ms
WS RTT:         34.18ms
Diff:           -2.35ms
VPN:            NO
```
```
$ node server.js 
Server TCP RTT for IP ::ffff:83.175.189.181: 36.129ms
```
client TCP RTT == WS RTT so there is no VPN.
client TCP RTT == server TCP RTT. It confirms that it is RTT of the same connection.

Example 2 - PL client to DE server, with ES VPN:
```
$node client.js
Testing 130.61.179.106:80

Client TCP RTT: 66.06ms
WS RTT:         97.87ms
Diff:           31.81ms
VPN:            YES
```
```
$ node server.js 
Server TCP RTT for IP ::ffff:212.102.48.3: 31.839ms
```
client TCP RTT is 30ms smaller than WS RTT so it is a VPN.
WS RTT == client TCP RTT + server TCP RTT (97 == 66 + 31). Which confirms that these are two separate TCP connections (client<-->VPN and VPN<-->server).
