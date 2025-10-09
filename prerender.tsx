import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prerenderAll() {
  // TODO: read src/pages folder and build prerender list automatically
  const pages = ['/not-found'];
  for (const page of pages) {
    await prerenderForPage(page);
  }
}

async function prerenderForPage(page: string) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8'
    );
    template = await vite.transformIndexHtml(page, template);
    const { render } = await vite.ssrLoadModule('./src/main.server.tsx');
    console.log(`📜 Prerendering for ${page} started...`);
    const { html: appHtml, helmetContext } = await render(page);
    const { helmet } = helmetContext;

    const newHead = `
      ${helmet.title.toString()}
      ${helmet.priority.toString()}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
      ${helmet.script.toString()}
      `;
    const html = template
      .replace(/<head>(.*?)<\/head>/s, `<head>${newHead}</head>`)
      .replace(`<!--ssr-outlet-->`, () => appHtml);

    if (!fs.existsSync(path.resolve(__dirname, 'static'))) {
      fs.mkdirSync(path.resolve(__dirname, 'static'));
    }

    fs.writeFileSync(
      path.resolve(__dirname, 'static', 'not-found.html'),
      html,
      'utf-8'
    );
    console.log(`✅  Prerendering ${page} complete.`);
  } catch (e) {
    vite.ssrFixStacktrace(e);
  } finally {
    vite.close();
  }
}

await prerenderAll();
