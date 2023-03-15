import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const port = 8081;
const app = express();
app.use(cors());

let rooms: Map<string, { memberCount: number }> = new Map();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  let currentRoomId = '';
  console.log(`User Connected: ${socket.id}`);

  socket.on('disconnecting', () => {
    const roomInformation = io.sockets.adapter.rooms.get(currentRoomId);
    io.to(currentRoomId).emit('leave_room', {
      status: 200,
      message: 'Jemand hat den Raum verlassen!',
      // We need to subtract one because the client doe not have yet disconnected from the room
      memberCount: roomInformation ? roomInformation.size - 1 : 0,
    });
  });

  socket.on('disconnect', (reason, description) => {
    console.log(reason, description);

    // Räume löschen welche nun keine Benutzer mehr haben
    // socket.rooms.forEach((room) => {
    //   const connectedClients = io.sockets.adapter.rooms.get(room)!.size;
    //   if (connectedClients === 0) {
    //     console.log('delete room ', room);
    //     io.sockets.adapter.rooms.delete(room);
    //   }
    // });
  });

  socket.on('create_room', (data) => {
    console.log('create_room', data);
    socket.join(data);
    rooms.set(data, { memberCount: io.sockets.adapter.rooms.get(data)?.size || 0 });
    io.to(socket.id).emit('create_room', { status: 200, message: 'Der Raum wurde erstellt', room: data });
  });

  socket.on('join_room', (data) => {
    console.log('join_room', data);
    // Prüfe ob der Raum bereits erstellt wurde
    if (rooms.has(data)) {
      socket.join(data);
      currentRoomId = data;
      const roomInformation = rooms.get(data);
      const updatedRoomInformation = {
        ...roomInformation,
        memberCount: io.sockets.adapter.rooms.get(data)?.size || 0,
      };
      rooms.set(data, updatedRoomInformation);
      io.to(socket.id).emit('join_room', {
        status: 200,
        message: 'Du bist dem Raum beigetreten',
        memberCount: updatedRoomInformation.memberCount,
      });

      // Nachricht verschicken, für andere Mitglieder die sich bereits im channel/room befinden
      io.to(data).emit('client_join_room', {
        status: 200,
        message: 'Jemand hat den Raum betreten!',
        memberCount: updatedRoomInformation.memberCount,
      });
    } else {
      io.to(socket.id).emit('join_room', { status: 404, message: 'Der Raum wurde nicht gefunden', memberCount: 0 });
    }
  });

  socket.on('leave_room', (data) => {
    console.log('leave_room', data);
    socket.leave(data);
    const roomInformation = rooms.get(data);
    const updatedRoomInformation = {
      ...roomInformation,
      memberCount: io.sockets.adapter.rooms.get(data)?.size || 0,
    };
    rooms.set(data, updatedRoomInformation);

    // Nachricht verschicken, für andere Mitglieder die sich bereits im channel/room befinden
    io.to(data).emit('leave_room', {
      status: 200,
      message: 'Jemand hat den Raum verlassen!',
      memberCount: updatedRoomInformation.memberCount,
    });
  });

  socket.on('set_video', (data: { room: string; videoUrl: string }) => {
    socket.to(data.room).emit('set_video', {
      status: 200,
      message: `Neues Video: '${data.videoUrl}'`,
      videoUrl: data.videoUrl,
    });
  });

  socket.on('sync', (data: { room: string; playedSeconds: number }) => {
    socket.to(data.room).emit('sync_video', {
      status: 200,
      message: `Vorgespult zu ${data.playedSeconds}`,
      playedSeconds: data.playedSeconds,
    });
  });
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
