"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const port = 8081;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
let rooms = new Map();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    // console.log(io.sockets.adapter.rooms);
    socket.on('create_room', (data) => {
        console.log('create_room', data);
        rooms.set(data, { memberCount: 1 });
        socket.join(data);
        console.log(rooms);
    });
    socket.on('join_room', (data) => {
        console.log('join_room', data);
        // Prüfe ob der Raum bereits erstellt wurde
        if (rooms.has(data)) {
            socket.join(data);
            const roomInformation = rooms.get(data);
            rooms.set(data, { memberCount: roomInformation.memberCount + 1 });
            io.to(socket.id).emit('join_room', { status: 200, message: 'Du bist dem Raum beigetreten' });
        }
        else {
            io.to(socket.id).emit('join_room', { status: 404, message: 'Der Raum wurde nicht gefunden' });
        }
        // Nachricht verschicken, für andere Mitglieder die sich bereits im channel/room befinden
        io.to(data).emit('join_room', { status: 200, message: 'Jemand hat den Raum betreten!' });
        console.log(rooms);
    });
    socket.on('leave_room', (data) => {
        console.log('leave_room', data);
        socket.leave(data);
        const roomInformation = rooms.get(data);
        rooms.set(data, { memberCount: roomInformation.memberCount - 1 });
        // Nachricht verschicken, für andere Mitglieder die sich bereits im channel/room befinden
        io.to(data).emit('leave_room', { status: 200, message: 'Jemand hat den Raum verlassen!' });
        console.log(rooms);
        // TODO: Prüfen ob der Raum noch über mitglieder verfügt, falls nicht, soll dieser nun gelöscht werden
    });
    // socket.on('send_message', (data) => {
    //   console.log('receive_message', data);
    //   socket.to(data.room).emit('receive_message', data);
    // });
});
server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});
