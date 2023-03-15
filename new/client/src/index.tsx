import { App } from './App';
import './theme/style/master.css';
import { DarkTheme, SnackbarProvider } from '@dulliag/components';
import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <ThemeProvider
      // theme={determineCurrentTheme('url_shortener.web.dark') === 'dark' ? DarkTheme : LightTheme}
      theme={DarkTheme}
    >
      <SnackbarProvider>
        <CssBaseline />
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
