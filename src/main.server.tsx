import { StrictMode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.server';
import './index.css';
const helmetContext = {};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

await i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../public/locales/${language}/${namespace}.json`)
    )
  )
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    debug: false,
    defaultNS: 'common',
    ns: ['common', 'visa', 'about', 'about-philippines'],
    react: {
      useSuspense: false, // Disable suspense for server-side rendering
      returnObjects: true, // Allow returning objects for complex translations
    },
  });

export async function render(location: string) {
  const html = ReactDOMServer.renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <App
          initialLanguage='en'
          initialI18nStore={i18n.store.data}
          location={location}
        ></App>
      </HelmetProvider>
    </StrictMode>
  );

  return { html, helmetContext };
}
