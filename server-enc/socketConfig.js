const { Server } = require("socket.io");

exports.socketServer = (server) => {
  console.log("Socket Sever Init");
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  let myio = io.of("/enc");
  let onlineUsers = [];
  //on connection
  myio.on("connect", (socket) => {
    /**Emmitt welcome text */
    socket.emit("welcome", "Server Socket Connection Success");

    // on payload transfer
    socket.on("payloadTransfer", (data) => {
      console.log("payload recieved:", data);
    });
  });
};
