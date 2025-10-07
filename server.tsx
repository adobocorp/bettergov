import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use('*all', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
      //    and also applies HTML transforms from Vite plugins, e.g. global
      //    preambles from @vitejs/plugin-react
      template = await vite.transformIndexHtml(url, template);

      // 3. Load the server entry. ssrLoadModule automatically transforms
      //    ESM source code to be usable in Node.js! There is no bundling
      //    required, and provides efficient invalidation similar to HMR.
      const { render } = await vite.ssrLoadModule('./src/main.server.tsx');

      // 4. render the app HTML. This assumes entry-server.js's exported
      //     `render` function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const { html: appHtml, helmetContext } = await render(req, res);
      const { helmet } = helmetContext;

      const newHead = `
      ${helmet.title.toString()}
      ${helmet.priority.toString()}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
      ${helmet.script.toString()}
      `;

      // 5. Inject the app-rendered HTML into the template.
      const html = template
        .replace(/<head>(.*?)<\/head>/s, `<head>${newHead}</head>`)
        .replace(`<!--ssr-outlet-->`, () => appHtml);

      // 6. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(5173);
}

createServer();
