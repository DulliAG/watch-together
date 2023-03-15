import { socket } from '../App';
import type {
  JoinRoomEventResponse,
  LeaveRoomEventResponse,
  SetVideoEventResponse,
  SyncVideoEventResponse,
} from '../types';
import { SnackbarContext } from '@dulliag/components';
import { Share as ShareIcon, PlayArrow as PlayIcon, Stop as StopIcon, Send as SendIcon } from '@mui/icons-material';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import React from 'react';
import Player from 'react-player';
import ReactPlayer from 'react-player';
import { useNavigate, useParams } from 'react-router-dom';

export const Room = () => {
  const id = React.useId();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const playerRef = React.useRef(null);
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [checkingRoom, setCheckingRoom] = React.useState(true);
  const [memberCount, setMemberCount] = React.useState(-1);
  const [messages, setMessages] = React.useState<string[]>([]);
  const [searchVideo, setSearchVideo] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [playing, setPlaying] = React.useState(false);
  const [seeking, setSeeking] = React.useState(false);

  const handler = {
    onShareRoom: () => {
      navigator.share({ url: window.location.href, title: `Raum ${roomId}` });
    },
    onSearchVideo: (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchVideo(event.target.value);
    },
    onSubmitVideo: () => {
      if (searchVideo === '') return;
      if (!Player.canPlay(searchVideo)) {
        return showSnackbar({ message: 'Dieses Video kann nicht abgespielt werden' });
      }
      setVideoUrl(searchVideo);
      socket.emit('set_video', { room: roomId, videoUrl: searchVideo });
    },
    addMessage: (message: string) => {
      setMessages((prev) => [...prev, message]);
    },
    onPlay: () => {
      console.log('playing');
      socket.emit('play_video', true);
      setPlaying(true);
    },
    onPause: () => {
      console.log('stoppping');
      socket.emit('play_video', false);
      setPlaying(false);
    },
    onProgress: ({ playedSeconds, played }: { playedSeconds: number; played: number }) => {
      console.log(playedSeconds, played);
      if (played < 1 && !seeking) {
        socket.emit('sync', { room: roomId, playedSeconds: playedSeconds });
      }

      if (seeking && played >= 1) {
        setSeeking(false);
      }
    },
    onSeek: (seconds: number) => {
      socket.emit('seek', seconds);
      setSeeking(true);
    },
    onError: (error: any, data?: any, hlsInstance?: any, hlsGlobal?: any) => {
      showSnackbar({ message: 'Das Video konnte nicht abgespielt werden' });
    },
  };

  React.useLayoutEffect(() => {
    if (roomId === '') return navigate('/room/not-found');
    socket.emit('join_room', roomId);

    socket.on('join_room', (data: JoinRoomEventResponse) => {
      console.log('YOU JOINED');
      console.log(data);
      if (data.status === 404) return navigate('/room/not-found');
      setCheckingRoom(false);
      setMemberCount(data.memberCount);
      handler.addMessage(data.message);
    });
  }, [roomId]);

  React.useEffect(() => {
    if (checkingRoom || roomId === '') return;
    socket.on('client_join_room', (data: JoinRoomEventResponse) => {
      console.log('SOMEBODY JOINED');
      console.log(data);
      setMemberCount(data.memberCount);
      handler.addMessage(data.message);
    });

    socket.on('leave_room', (data: LeaveRoomEventResponse) => {
      console.log('SOMEBODY LEFT');
      console.log(data);
      setMemberCount(data.memberCount);
      handler.addMessage(data.message);
    });

    socket.on('set_video', (data: SetVideoEventResponse) => {
      console.log(data);
      if (data.status !== 200) return showSnackbar({ message: 'Video nicht gefunden' });
      setVideoUrl(data.videoUrl);
      showSnackbar({ message: data.message });
      handler.addMessage(data.message);
    });

    socket.on('play_video', (data) => {
      console.log(data);
    });

    socket.on('sync_video', (data: SyncVideoEventResponse) => {
      console.log(data);
    });

    socket.on('seek', (data) => {
      console.log(data);
    });

    window.onbeforeunload = () => {
      console.log('unloading');
      socket.emit('leave_room', roomId);
    };

    window.onclose = () => {
      console.log('closing');
      socket.emit('leave_room', roomId);
    };

    return () => {
      console.log('clearing');
      socket.emit('leave_room', roomId);
      ['join_room', 'client_join_room', 'leave_room', 'set_video', 'play_video', 'sync_video'].forEach((event) =>
        socket.removeListener(event)
      );
    };
  }, [roomId, checkingRoom]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handler.onSubmitVideo();
            }}
          >
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel htmlFor="outlined-adornment-password">Video</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type="url"
                onChange={handler.onSearchVideo}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handler.onSubmitVideo} edge="end">
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                }
                label="Video"
              />
            </FormControl>
          </form>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8} lg={9} xl={9}>
        <Paper /*sx={{ width: '100%', height: 'auto', aspectRatio: '16/9', p: 2, mb: 1 }}*/>
          {videoUrl.length > 0 ? (
            <ReactPlayer
              ref={playerRef}
              width={'100%'}
              height={'100%'}
              url={videoUrl}
              playing={playing}
              onPlay={handler.onPlay}
              onPause={handler.onPause}
              onSeek={handler.onSeek}
              onProgress={handler.onProgress}
              onError={handler.onError}
              controls={true}
              config={{ youtube: { playerVars: {} } }}
            />
          ) : (
            <Skeleton sx={{ width: '100%', height: '100%', transform: 'unset' }} />
          )}
        </Paper>

        <Paper sx={{ width: { xs: '100%', md: 'max-content' }, p: 0.5 }}></Paper>
      </Grid>

      <Grid item xs={12} md={4} lg={3} xl={3}>
        <Paper sx={{ p: 2 }}>
          <Typography>
            <strong>Raum:</strong> {roomId}
          </Typography>
          <Typography>
            <strong>Mitglieder:</strong> {memberCount} online
          </Typography>
          <FormControl variant="outlined" size="small" fullWidth sx={{ mt: 1 }}>
            <InputLabel htmlFor="outlined-adornment-password">Raum</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type="url"
              defaultValue={window.location.href}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={handler.onShareRoom} edge="end">
                    <ShareIcon />
                  </IconButton>
                </InputAdornment>
              }
              label="Raum"
            />
          </FormControl>
        </Paper>

        <Divider sx={{ my: 2 }} />

        <Paper sx={{ p: 2 }}>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <Paper key={id + '-messages-' + index} elevation={2}>
                <Typography>{msg}</Typography>
              </Paper>
            ))
          ) : (
            <Paper elevation={2}>
              <Typography textAlign="center">Keine Nachrichten</Typography>
            </Paper>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
