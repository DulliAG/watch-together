import { BrandName, CookieDisclaimer, NavbarNonAuthLinks, Footer } from './components';
import { JoinRoom, PageNotFound, Room, RoomNotFound } from './view';
import { Breadcrumb, Main, Navbar, useWindowDimensions } from '@dulliag/components';
import { Container } from '@mui/material';
import { Route, Router, Routes } from 'react-router-dom';
import { connect } from 'socket.io-client';

export const socket = connect('http://localhost:8081');

export const App = () => {
  const query = new URLSearchParams(window.location.search);
  const { breakpoint } = useWindowDimensions();

  return (
    <Main>
      <CookieDisclaimer />
      {/* <ServiceBar /> */}
      <Navbar
        sx={{
          position: 'sticky',
        }}
        brand={<BrandName />}
        pages={NavbarNonAuthLinks}
      />
      <Breadcrumb
        sx={{
          position: 'sticky',
          top: breakpoint === 'xs' ? 56 : 64,
        }}
        links={[
          {
            text: 'Home',
            href: '/',
          },
        ]}
      />

      <Container maxWidth="xl" sx={{ my: 2 }}>
        <Routes>
          <Route index element={<JoinRoom />} />
          <Route path="/room/">
            <Route path=":roomId" element={<Room />} />
            <Route path="not-found" element={<RoomNotFound />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Container>

      <Footer />
    </Main>
  );
};
