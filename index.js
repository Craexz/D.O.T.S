const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 80;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.on("newPlayer", (data) => {
    console.log(data.un + " logged in!");
    var userData = {
      un: data.un,
      sid: socket.id
    };
    socket.broadcast.emit("addPlayer", userData);

    var sidData = {
      sid: socket.id
    };
    socket.broadcast.emit("getPlayers", sidData);
  });

  socket.on("newExistingPlayer", (data) => {
    console.log("Sent existing player: " + data.un);
    io.to(data.sid).emit("addExistingPlayer", data);
  });

  socket.on("move", (data) => {
    socket.broadcast.emit("moveBroadcast", data);
  });
  socket.on("message", (data) => {
    const newData = {
      message: data.message
    };

    socket.broadcast.emit("message", newData);
  });
  socket.on("disconnect", (data) => {
    var leaveData = {
      sid: socket.id
    };
    console.log("Player left with the socket id: " + leaveData.sid);
    socket.broadcast.emit("playerLeave", leaveData);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
