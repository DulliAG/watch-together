export type Room = {
  id: string;
  memberCount: number;
  videoUrl: string;
};

export type CreateRoomEventResponse = {
  status: 200;
  message: string;
  room: Room;
};

export type JoinRoomEventResponse =
  | {
      status: 200;
      message: string;
      room: Room;
    }
  | { status: 404; message: string };

export type LeaveRoomEventResponse = {
  status: 200;
  message: string;
  room: Room;
};

export type ChangeVideoEventResponse = {
  status: 200;
  message: string;
  room: Room;
};

export type StartVideoEventResponse = {
  status: 200;
  currentTime: number;
  playVideo: boolean;
};

export type StopVideoEventResponse = {
  status: 200;
  playVideo: boolean;
};

/** Happens sometimes, it's a bug */
export type RoomClosedEventResponse = {
  status: 500;
  message: string;
};
