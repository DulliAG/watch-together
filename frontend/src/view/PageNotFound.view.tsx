import { HomeOutlined as HomeIcon } from '@mui/icons-material';
import { Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: { xs: '100%', md: '40%', lg: '30%' },
        p: 2,
        mx: 'auto',
      }}
    >
      <Typography variant="h2" textAlign="center">
        404 - Page Not Found
      </Typography>
      <Button startIcon={<HomeIcon />} onClick={() => navigate('/')} sx={{ width: 'max-content', mt: 1 }}>
        Startseite
      </Button>
    </Paper>
  );
};
