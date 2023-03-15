import { socket } from '../App';
import type { CreateRoomEventResponse } from '../types';
import { SnackbarContext } from '@dulliag/components';
import { Add as AddIcon, Login as LoginIcon } from '@mui/icons-material';
import {
  Grid,
  Box,
  Typography,
  Button,
  FormControl,
  OutlinedInput,
  InputAdornment,
  InputLabel,
  IconButton,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const JoinRoom = () => {
  const navigate = useNavigate();
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [room, setRoom] = React.useState('');

  const handler = {
    onCreateRoom: () => {
      socket.emit('create_room', crypto.randomUUID());
    },
    onJoinRoom: () => {
      if (room === '' || room.length < 1) return;
      navigate(`/room/${room}`);
      showSnackbar({ message: 'Du bist einem Raum beigetreten' });
    },
    onJoinRoomChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setRoom(event.target.value);
    },
  };

  React.useEffect(() => {
    socket.on('create_room', ({ status, message, room }: CreateRoomEventResponse) => {
      if (status !== 200) {
        return showSnackbar({
          message: 'Der Raum wird betreten',
          action: <Button onClick={handler.onCreateRoom}>Erneut</Button>,
        });
      }

      const roomUrl = `${window.location.origin}/room/${room}`;
      navigate(`/room/${room}`);
      showSnackbar({
        message: message,
        action: (
          <Button
            onClick={() => {
              navigator.share({ url: roomUrl, title: `Raum ${room}` });
            }}
          >
            Teilen
          </Button>
        ),
      });
    });

    return () => {
      socket.removeListener('create_room');
    };
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h1" sx={{ mb: 3, textAlign: 'center' }}>
          Watch2Gätha
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <FormControl
            sx={{ width: { xs: '100%', md: 'unset' }, mr: { xs: 0, md: 2 }, mb: 2 }}
            variant="outlined"
            size="small"
          >
            <InputLabel htmlFor="outlined-adornment-room">Raum</InputLabel>
            <OutlinedInput
              id="outlined-adornment-room"
              onChange={handler.onJoinRoomChange}
              value={room}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={handler.onJoinRoom}>
                    <LoginIcon />
                  </IconButton>
                </InputAdornment>
              }
              label="Raum"
            />
          </FormControl>

          <Button variant="contained" onClick={handler.onCreateRoom} startIcon={<AddIcon />} sx={{ mb: 2 }}>
            Raum erstellen
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};
