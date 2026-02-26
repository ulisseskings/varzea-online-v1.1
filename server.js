const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

/* ===============================
   ROTAS
================================ */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "device.html"));
});

app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   UTILIDADES
================================ */

function generateRoomCode(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]);
  return code;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* ===============================
   DECKS COMPLETOS (EMBUTIDOS)
================================ */

const baseDecks = {
  A: [
    {type:"A",value:1,front:"https://i.imgur.com/vUy286Z.png"},
    {type:"A",value:2,front:"https://i.imgur.com/PcI0Vg0.png"},
    {type:"A",value:3,front:"https://i.imgur.com/tQ5NRhZ.png"},
    {type:"A",value:4,front:"https://i.imgur.com/qvVCUvs.png"},
    {type:"A",value:5,front:"https://i.imgur.com/b8BUvIr.png"},
    {type:"A",value:6,front:"https://i.imgur.com/uUYXht4.png"},
    {type:"A",value:7,front:"https://i.imgur.com/9JlDEiD.png"},
    {type:"A",value:8,front:"https://i.imgur.com/7p064Zr.png"},
    {type:"A",value:9,front:"https://i.imgur.com/JnGApCb.png"},
    {type:"A",value:10,front:"https://i.imgur.com/s4cqIRX.png"},
    {type:"A",value:11,front:"https://i.imgur.com/oShuvz0.png"}
  ],
  M: [
    {type:"M",value:1,front:"https://i.imgur.com/ugO1evz.png"},
    {type:"M",value:2,front:"https://i.imgur.com/mmTSHr0.png"},
    {type:"M",value:3,front:"https://i.imgur.com/waMOMtp.png"},
    {type:"M",value:4,front:"https://i.imgur.com/wZRwPFu.png"},
    {type:"M",value:5,front:"https://i.imgur.com/IS6ZtbR.png"},
    {type:"M",value:6,front:"https://i.imgur.com/jAWX4zE.png"},
    {type:"M",value:7,front:"https://i.imgur.com/LJhq0nv.png"},
    {type:"M",value:8,front:"https://i.imgur.com/vqdoNCs.png"},
    {type:"M",value:9,front:"https://i.imgur.com/rj4f8V4.png"},
    {type:"M",value:10,front:"https://i.imgur.com/z6Iu3cF.png"},
    {type:"M",value:11,front:"https://i.imgur.com/ZOLX7FA.png"}
  ],
  D: [
    {type:"D",value:1,front:"https://i.imgur.com/D1Y4e26.png"},
    {type:"D",value:2,front:"https://i.imgur.com/oMZM3MY.png"},
    {type:"D",value:3,front:"https://i.imgur.com/RuSt23l.png"},
    {type:"D",value:4,front:"https://i.imgur.com/S8solyg.png"},
    {type:"D",value:5,front:"https://i.imgur.com/SvbTxPU.png"},
    {type:"D",value:6,front:"https://i.imgur.com/CBX45jL.png"},
    {type:"D",value:7,front:"https://i.imgur.com/VrydzEx.png"},
    {type:"D",value:8,front:"https://i.imgur.com/TZtXcos.png"},
    {type:"D",value:9,front:"https://i.imgur.com/edygsCM.png"},
    {type:"D",value:10,front:"https://i.imgur.com/5ozxRfC.png"},
    {type:"D",value:11,front:"https://i.imgur.com/tMM8885.png"}
  ],
  G: [
    {type:"G",value:1,front:"https://i.imgur.com/lp3QMF3.png"},
    {type:"G",value:2,front:"https://i.imgur.com/3jcTA5Y.png"},
    {type:"G",value:3,front:"https://i.imgur.com/H6xUtnk.png"},
    {type:"G",value:4,front:"https://i.imgur.com/Dnu7miw.png"},
    {type:"G",value:5,front:"https://i.imgur.com/whdZPGA.png"},
    {type:"G",value:6,front:"https://i.imgur.com/RxQwOpm.png"},
    {type:"G",value:7,front:"https://i.imgur.com/A2gOjsC.png"},
    {type:"G",value:8,front:"https://i.imgur.com/Hzr5yXJ.png"},
    {type:"G",value:9,front:"https://i.imgur.com/TDJACZ7.png"},
    {type:"G",value:10,front:"https://i.imgur.com/8KBP5mp.png"},
    {type:"G",value:11,front:"https://i.imgur.com/YbpqY9d.png"}
  ],
  P: [
    {type:"P",value:1,front:"https://i.imgur.com/q918kK5.png"},
    {type:"P",value:2,front:"https://i.imgur.com/E6oqQUD.png"},
    {type:"P",value:3,front:"https://i.imgur.com/LUdrcpW.png"},
    {type:"P",value:4,front:"https://i.imgur.com/Dyd1beK.png"}
  ]
};

/* ===============================
   ESTADO
================================ */

let rooms = {};

/* ===============================
   SOCKET
================================ */

io.on("connection", (socket) => {

  socket.on("createRoom", ({ name, role }) => {

    const roomCode = generateRoomCode();

    rooms[roomCode] = {
      players: { blue: null, red: null },
      spectators: [],
      hands: { blue: [], red: [] },
      decks: JSON.parse(JSON.stringify(baseDecks))
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.role = role;
    socket.playerName = name;

    if (role === "blue") rooms[roomCode].players.blue = name;
    if (role === "red") rooms[roomCode].players.red = name;
    if (role === "spectator") rooms[roomCode].spectators.push(name);

    socket.emit("roomCreated", roomCode);
  });

  socket.on("joinRoom", ({ name, role, roomCode }) => {

    if (!rooms[roomCode]) {
      socket.emit("roomError", "Sala não existe.");
      return;
    }

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.role = role;
    socket.playerName = name;

    socket.emit("roomJoined", roomCode);
  });

});

/* ===============================
   START
================================ */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Servidor rodando na porta:", PORT);
});