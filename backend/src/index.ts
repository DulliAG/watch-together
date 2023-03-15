import cors from 'cors';
import { format } from 'date-fns';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const port = 8081;
const app = express();
app.use(cors());

export type Room = {
  id: string;
  memberCount: number;
  videoUrl: string;
};

let rooms: Map<string, Room> = new Map();

function log(message: string) {
  console.log(`[${format(new Date(), 'HH:mm:ss')}] ${message}`);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  function getRoomMemberCount(roomId: string) {
    return io.sockets.adapter.rooms.get(roomId)?.size || 0;
  }

  let currentRoomId = '';
  log(`client_connected | ${socket.id}`);
  // TODO: Check if the user is currently connected to an "unregistered" room. This can happen when the backend(this part of the app) crashes and the clients reconnect

  socket.on('disconnect', (reason, description) => {
    log(`client_disconnected | ${socket.id}`);

    if (currentRoomId !== '') {
      const lastConnectedRoom = io.sockets.adapter.rooms.get(currentRoomId);
      if (!lastConnectedRoom) {
        // Socket verfügt nicht mehr über den Raum, weshalb wir ihn auch aus unserer Liste entfernen
        rooms.delete(currentRoomId);
        currentRoomId = '';
        return;
      }

      // Prüfe ob der Socket leer ist oder noch jemand zu verbunden ist
      if (lastConnectedRoom.size === 0) {
        rooms.delete(currentRoomId);
        io.sockets.adapter.rooms.delete(currentRoomId);
      } else {
        // Es befinden sich noch Clients im Raum, weshalb wir diese darüber informieren dass ein Client den Raum verlassen hat
        const roomInformation = rooms.get(currentRoomId) as Room;
        io.to(currentRoomId).emit('leave_room', {
          status: 200,
          message: 'Jemand hat den Raum verlassen!',
          room: {
            ...roomInformation,
            memberCount: getRoomMemberCount(currentRoomId),
          },
        });
      }
      currentRoomId = '';
    }
  });

  socket.on('create_room', (roomId) => {
    log(`create_room | ${roomId}`);
    socket.join(roomId);
    const room: Room = {
      id: roomId,
      memberCount: getRoomMemberCount(roomId),
      videoUrl: '',
    };
    rooms.set(roomId, room);
    io.to(socket.id).emit('create_room', {
      status: 200,
      message: 'Der Raum wurde erstellt',
      room: room,
    });
  });

  // FIXME: Wenn ein Benutzer beitritt, soll das aktuelle Video mitgeliefert werden, sowie die aktuelle abspielzeit
  socket.on('join_room', (roomId) => {
    log(`join_room | ${roomId}`);

    // Prüfe ob der Raum bereits erstellt wurde
    if (rooms.has(roomId)) {
      socket.join(roomId);
      currentRoomId = roomId;
      const roomInformation = rooms.get(roomId) as Room;
      const updatedRoomInformation: Room = {
        ...roomInformation,
        memberCount: getRoomMemberCount(roomId),
      };
      rooms.set(roomId, updatedRoomInformation);
      io.to(socket.id).emit('join_room', {
        status: 200,
        message: 'Du bist dem Raum beigetreten',
        room: updatedRoomInformation,
      });

      // Nachricht verschicken, für andere Mitglieder die sich bereits im channel/room befinden
      io.to(roomId).emit('client_join_room', {
        status: 200,
        message: 'Jemand hat den Raum betreten!',
        room: updatedRoomInformation,
      });
    } else {
      io.to(socket.id).emit('join_room', {
        status: 404,
        message: 'Der Raum wurde nicht gefunden',
      });
    }
  });

  socket.on('leave_room', (roomId) => {
    log(`leave_room | ${roomId}`);
    if (roomId === '' || !rooms.has(roomId)) return log(`leave_room | room ${roomId} not found`);
    socket.leave(roomId);
    const roomInformation = rooms.get(roomId) as Room;
    const updatedRoomInformation: Room = {
      ...roomInformation,
      memberCount: getRoomMemberCount(roomId),
    };
    if (updatedRoomInformation.memberCount === 0 && getRoomMemberCount(roomId)) {
      log(`delete_room | ${roomId}`);
      socket.emit(roomId, { status: 500, message: 'Der Raum wurde geschlossen' });
      io.sockets.adapter.rooms.delete(roomId);
      rooms.delete(roomId);
      return;
    }

    rooms.set(roomId, updatedRoomInformation);

    // Nachricht verschicken, für andere Mitglieder die sich bereits im channel/room befinden
    io.to(roomId).emit('leave_room', {
      status: 200,
      message: 'Jemand hat den Raum verlassen!',
      room: updatedRoomInformation,
    });
  });

  socket.on('set_video', (data: { roomId: string; videoUrl: string }) => {
    log(`set_video | ${data.roomId} ${data.videoUrl}`);
    if (!data.roomId || !rooms.has(data.roomId)) return log(`set_video | room ${data.roomId} not found`);
    const roomInformation = rooms.get(data.roomId) as Room;
    const updatedRoomInformation: Room = {
      ...roomInformation,
      videoUrl: data.videoUrl,
    };
    rooms.set(data.roomId, updatedRoomInformation);
    socket.to(data.roomId).emit('change_video', {
      status: 200,
      message: `Neues Video: '${data.videoUrl}'`,
      room: updatedRoomInformation,
    });
  });

  socket.on('play_video', (data: { roomId: string; playVideo: boolean; currentTime?: number }) => {
    log(`play_video | ${data.roomId} ${data.playVideo}`);
    console.log(rooms.has(data.roomId));
    console.log(io.sockets.adapter.rooms.has(data.roomId));
    if (!data.roomId || !rooms.has(data.roomId)) return log(`play_video | room ${data.roomId} not found`);

    if (data.playVideo) {
      socket.to(data.roomId).emit('start_video', {
        status: 200,
        playing: true,
        currentTime: data.currentTime,
      });
    } else {
      socket.to(data.roomId).emit('stop_video', {
        status: 200,
        playing: false,
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
