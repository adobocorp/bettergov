import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { dir } from 'console';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Types of routes to skip:
 * - Dynamic routes (e.g., [param].tsx)
 * - Layout routes (e.g., layout.tsx)
 * - Component routes (e.g., components/ComponentName.tsx)
 * - Specific pages that are not meant to be prerendered
 */
const skipRoutes = [
  '/flood-control-projects/contractors/[contractor-name]',
  '/flood-control-projects/map',
  '/flood-control-projects/shared-components',
  '/flood-control-projects/tab',
  '/government/constitutional/[office]',
  '/government/constitutional/layout',
  '/government/departments/[department]',
  '/government/departments/layout',
  '/government/diplomatic/layout',
  '/government/executive/layout',
  '/government/layout',
  '/government/legislative/[chamber]',
  '/government/local/[region]',
  '/government/constitutional/components/constitutional-sidebar',
  '/government/departments/components/departments-sidebar',
  '/government/diplomatic/components/diplomatic-sidebar',
  '/government/executive/components/executive-sidebar',
  '/government/legislative/components/legislative-sidebar',
  '/government/legislative/layout',
  '/government/government-page-container',
  '/government/local/components/local-layout',
  '/government/local/components/local-sidebar',
  '/travel/visa-types/[type]',
  '/philippines/map',
];

async function getPrerenderedPages() {
  const traverse = dir => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(traverse(file));
      } else {
        results.push(file);
      }
    });
    return results;
  };

  const pagesDir = path.resolve(rootDir, 'src', 'pages');
  const files = traverse(pagesDir);
  const pages = files
    .map(file => path.relative(pagesDir, file).replace(/\\/g, '/'))
    .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'))
    .map(
      file =>
        '/' + file.replace(/(index)?\.(tsx|jsx)$/, '').replace(/\/+/g, '/')
    );

  const filteredPages = pages.filter(page => !skipRoutes.includes(page));
  return filteredPages;
}

async function prerenderAll() {
  const pages = await getPrerenderedPages();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  let template = fs.readFileSync(path.resolve(rootDir, 'index.html'), 'utf-8');
  const prerenderPromises = [];
  for (const page of pages) {
    prerenderPromises.push(prerenderForPage(vite, template, page));
  }
  try {
    await Promise.allSettled(prerenderPromises);
  } catch (e) {
    vite.ssrFixStacktrace(e);
  } finally {
    vite.close();
  }
}

async function prerenderForPage(vite, template, page) {
  console.log(`📜 Prerendering for ${page} started...`);
  await renderPage(vite, template, page)
    .then(html => {
      if (html) {
        savePrerenderedPage(page, html);
      }
    })
    .catch(e => {
      return Promise.reject(e);
    });
}

async function renderPage(vite, template, page) {
  try {
    const renderedTemplate = await vite.transformIndexHtml(page, template);
    const { render } = await vite.ssrLoadModule(
      path.resolve(rootDir, 'src', 'main.server.tsx')
    );
    const { html: appHtml, helmetContext } = await render(page);
    const { helmet } = helmetContext;

    const newHead = `
      ${helmet.title.toString()}
      ${helmet.priority.toString()}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
      ${helmet.script.toString()}
      `;
    const html = renderedTemplate
      .replace(/<head>(.*?)<\/head>/s, `<head>${newHead}</head>`)
      .replace(`<!--ssr-outlet-->`, () => appHtml);

    const formattedHtml = prettier.format(html, { parser: 'html' });

    return formattedHtml;
  } catch (e) {
    console.error(`❌  Prerendering for ${page} failed`);
    Promise.reject(e);
  }
}

async function savePrerenderedPage(page, html) {
  try {
    const prerenderRoot = path.resolve(rootDir, 'static');
    if (!fs.existsSync(prerenderRoot)) {
      fs.mkdirSync(prerenderRoot, { recursive: true });
    }
    const isRoot = page === '/';
    if (isRoot) {
      page = '/index';
    } else if (page.endsWith('/')) {
      page = page.slice(0, -1);
    }
    const filePath = path.join(prerenderRoot, `${page}.html`);
    const basename = path.basename(filePath);
    const dirname = path.dirname(filePath);
    if (dirname !== prerenderRoot) {
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, {
          recursive: true,
        });
      }
    }

    const finalFilePath = path.resolve(dirname, basename);
    fs.writeFileSync(finalFilePath, html, 'utf-8');
    console.log(`💾  Saved prerendered page to ${filePath}`);
  } catch (e) {
    Promise.reject(e);
  }
}

await prerenderAll();
