const { Server } = require("socket.io");

const io = new Server(8000, {
    cors: true,
});

const nameToSocketIdMap = new Map();
const socketidToNameMap = new Map();

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id);
    socket.on('room:join', data => {
        const { name } = data;
        nameToSocketIdMap.set(name, socket.id);
        socketidToNameMap.set(socket.id, name);
        io.to(socket.id).emit("room:join", data);
    })
});