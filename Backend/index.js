const { Server } = require("socket.io");

const io = new Server(8000, {
    cors: true,
});

const nameToSocketIdMap = new Map();
const socketidToNameMap = new Map();

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id);
    socket.on('room:join', data => {
        const { name, room } = data;
        console.log(`User "${name}" is joining room "${room}". Socket ID: ${socket.id}`);
        nameToSocketIdMap.set(name, socket.id);
        socketidToNameMap.set(socket.id, name);
        io.to(room).emit("user:joined", {name, id:socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });

    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer });
    })
    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans });
    })

    socket.on('peer:nego:needed', ({ to, offer }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    })

    socket.on('peer:nego:done', ({ to, ans }) => {
        io.to(to).emit('peer:nego:final', { from: socket.id, ans });
    })
});