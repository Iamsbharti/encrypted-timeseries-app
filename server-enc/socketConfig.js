const WebSocket = require("ws");

exports.socketServer = (server) => {
  let wss = new WebSocket.Server({ server: server });
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("received: %s", message);
      ws.send(`Hello, you sent -> ${message}`);
    });

    ws.send("connected");
  });
};
