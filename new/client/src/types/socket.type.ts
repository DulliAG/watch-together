export type CreateRoomEventResponse = {
  status: number;
  message: string;
  room: string;
};

export type JoinRoomEventResponse = {
  status: number;
  message: string;
  memberCount: number;
};

export type LeaveRoomEventResponse = {
  status: number;
  message: string;
  memberCount: number;
};

export type SetVideoEventResponse = {
  status: number;
  message: string;
  videoUrl: string;
};

export type SyncVideoEventResponse = {
  status: number;
  message: string;
  playedSeconds: number;
};
