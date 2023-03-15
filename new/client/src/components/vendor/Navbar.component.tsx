import { NavbarLink } from '@dulliag/components';
import { SmartDisplayOutlined as SmartDisplayIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import React from 'react';

export const BrandName: React.FC = () => {
  return (
    <Typography
      variant="h6"
      sx={{
        display: 'flex',
        alignItems: 'center',
        mr: 2,
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '.2rem',
        textDecoration: 'none',
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <SmartDisplayIcon sx={{ mr: 1, fontSize: '130%' }} />
      Watch2Gätha
    </Typography>
  );
};

export const NavbarNonAuthLinks: NavbarLink[] = [
  { text: 'Webseite', href: 'https://dulliag.de' },
  { text: 'GitHub', href: 'https://github.com/DulliAG/' },
];
