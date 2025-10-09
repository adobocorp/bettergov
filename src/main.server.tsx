import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { Route, Routes } from 'react-router-dom';
import NotFound from './pages/NotFound.tsx';
import Home from './pages/Home.tsx';
// import Navbar from './components/layout/Navbar';
// import Ticker from './components/ui/Ticker';
// import ScrollToTop from './components/ui/ScrollToTop';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar.tsx';
import { Request } from 'express';
const helmetContext = {};

export async function render(req: Request) {
  console.log(req.url);

  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={req.originalUrl}>
          {/* The rest of your app goes here */}
          <div className='min-h-screen flex flex-col'>
            <Navbar />
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </StaticRouter>
      </HelmetProvider>
    </React.StrictMode>
  );

  return { html, helmetContext };
}
