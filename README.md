This check is based on the "Latency Test" from https://proxydetect.live/: "This test compares incoming TCP/IP latencies to WebSocket latencies initiated via JavaScript on the client side. If the WebSocket latency is significantly higher than the TCP/IP latency, then it is likely a Proxy or VPN connection."

`server.js` - is a WS and HTTP server. Measures TCP RTT for incoming connections.
`client.js` - is a client. Measures the TCP RTT and WS RTT.

Example 1 - no VPN:


Example 2 - with VPN:
