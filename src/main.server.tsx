import { StrictMode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.server';
import './index.css';
const helmetContext = {};

export async function render(location: string) {
  const html = ReactDOMServer.renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <App location={location}></App>
      </HelmetProvider>
    </StrictMode>
  );

  return { html, helmetContext };
}
