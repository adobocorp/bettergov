import React from 'react';
import {
  createStaticRouter,
  createStaticHandler,
  StaticHandlerContext,
  StaticRouterProvider,
} from 'react-router-dom/server';
import createFetchRequest from './lib/request.ts';
import ReactDOMServer from 'react-dom/server';
import { routes } from './routes.tsx';
import { HelmetProvider } from 'react-helmet-async';
const helmetContext = {};
const { query, dataRoutes } = createStaticHandler(routes);

export async function render(req, res) {
  const fetchRequest = createFetchRequest(req, res);
  const context = (await query(fetchRequest)) as StaticHandlerContext;

  // If we got a redirect response, short circuit and let our Express server
  // handle that directly
  if (context instanceof Response) {
    throw context;
  }

  const router = createStaticRouter(dataRoutes, context);
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouterProvider router={router} context={context} />
      </HelmetProvider>
    </React.StrictMode>
  );
  return { html, helmetContext };
}
