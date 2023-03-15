import { socket } from '../App';
import type {
  JoinRoomEventResponse,
  LeaveRoomEventResponse,
  ChangeVideoEventResponse,
  StartVideoEventResponse,
  StopVideoEventResponse,
  RoomClosedEventResponse,
} from '../types';
import { SnackbarContext } from '@dulliag/components';
import { Share as ShareIcon, Send as SendIcon } from '@mui/icons-material';
import {
  Box,
  Button,
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
  const { showSnackbar } = React.useContext(SnackbarContext);
  const playerRef = React.useRef<ReactPlayer | null>(null);
  const { roomId } = useParams();
  // Room states
  const [checkingRoom, setCheckingRoom] = React.useState(true);
  const [memberCount, setMemberCount] = React.useState(0);
  const [messages, setMessages] = React.useState<string[]>([]);
  // Video states
  const [searchVideo, setSearchVideo] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  // Playing state
  const [playing, setPlaying] = React.useState(false);

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
      socket.emit('set_video', { roomId: roomId, videoUrl: searchVideo });
      handler.addMessage('Du hast das Video gewechselt');
    },
    addMessage: (message: string) => {
      setMessages((prev) => [...prev, message]);
    },
    onPlay: () => {
      if (!playerRef || !playerRef.current) {
        return showSnackbar({
          message: 'Video konnte nicht gestartet werden',
          action: <Button onClick={handler.onPlay}>Erneut</Button>,
        });
      }
      socket.emit('play_video', { roomId: roomId, playVideo: true, currentTime: playerRef.current?.getCurrentTime() });
      setPlaying(true);
    },
    onPause: () => {
      socket.emit('play_video', { roomId: roomId, playVideo: false });
      setPlaying(false);
    },
    onError: (error: any, data?: any, hlsInstance?: any, hlsGlobal?: any) => {
      showSnackbar({ message: 'Das Video konnte nicht abgespielt werden' });
    },
  };

  React.useLayoutEffect(() => {
    if (roomId === '') return navigate('/room/not-found');
    socket.emit('join_room', roomId);

    socket.on('join_room', (data: JoinRoomEventResponse) => {
      if (data.status === 404) return navigate('/room/not-found');
      const { room, message } = data;
      setCheckingRoom(false);
      setMemberCount(room.memberCount);
      setVideoUrl(room.videoUrl);
      handler.addMessage(message);
    });
  }, [roomId]);

  React.useEffect(() => {
    if (checkingRoom || roomId === '') return;
    socket.on('client_join_room', (data: JoinRoomEventResponse) => {
      if (data.status === 404) return; // Will never happen
      const { room, message } = data;
      setMemberCount(room.memberCount);
      handler.addMessage(message);
    });

    socket.on('leave_room', ({ room, message }: LeaveRoomEventResponse) => {
      setMemberCount(room.memberCount);
      handler.addMessage(message);
    });

    socket.on('change_video', (data: ChangeVideoEventResponse) => {
      setVideoUrl(data.room.videoUrl);
      handler.addMessage('Es wird ein neues Video abgespielt');
    });

    socket.on('start_video', (data: StartVideoEventResponse) => {
      console.log(data);
      if (!playerRef || !playerRef.current) {
        return showSnackbar({ message: 'Das Video konnte nicht gestartet werden' });
      }

      const currentPlayerTime = playerRef.current.getCurrentTime();
      if (Math.round(currentPlayerTime) !== Math.round(data.currentTime)) {
        playerRef.current.seekTo(data.currentTime);
        setPlaying(true);
      } else setPlaying(true);
    });

    socket.on('stop_video', (data: StopVideoEventResponse) => {
      setPlaying(false);
    });

    socket.on('room_closed', (data: RoomClosedEventResponse) => {
      navigate('/');
      showSnackbar({ message: data.message });
    });

    return () => {
      socket.emit('leave_room', roomId);
      [
        'join_room',
        'client_join_room',
        'leave_room',
        'change_video',
        'start_video',
        'stop_video',
        'room_closed',
      ].forEach((event) => socket.removeListener(event));
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
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="outlined-adornment-password">Video</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type="url"
                onChange={handler.onSearchVideo}
                value={searchVideo}
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
        <Box>
          {videoUrl.length > 0 ? (
            <ReactPlayer
              ref={playerRef}
              width={'100%'}
              height={'100%'}
              url={videoUrl}
              playing={playing}
              onPlay={handler.onPlay}
              onPause={handler.onPause}
              onSeek={console.log}
              onError={handler.onError}
              controls={true}
            />
          ) : (
            <Skeleton sx={{ width: '100%', height: 'auto', aspectRatio: '16/9', transform: 'unset' }} />
          )}
        </Box>
      </Grid>

      <Grid item xs={12} md={4} lg={3} xl={3}>
        <Paper sx={{ p: 2 }}>
          <Typography>
            <strong>Raum:</strong> {roomId}
          </Typography>
          <Typography>
            <strong>Mitglieder:</strong> {memberCount} verbunden
          </Typography>
          <FormControl variant="outlined" fullWidth sx={{ mt: 1 }}>
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
              readOnly
            />
          </FormControl>
        </Paper>

        <Paper sx={{ mt: 2, p: 2 }}>
          {messages.length > 0 ? (
            messages.slice(0, 5).map((msg, index) => <Typography key={id + '-messages-' + index}>{msg}</Typography>)
          ) : (
            <Typography textAlign="center">Keine Nachrichten</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};
