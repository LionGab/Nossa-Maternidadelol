/**
 * Sentry Stub para Web
 * Mock do Sentry para ambiente web onde @sentry/react-native não funciona
 */

export const SentryWeb = {
  init: () => {
    console.log('Sentry: Web não suportado, usando console.log');
  },
  captureException: (error: Error) => {
    console.error('Sentry (web):', error);
  },
  captureMessage: (message: string) => {
    console.log('Sentry (web):', message);
  },
  setUser: () => {},
  setContext: () => {},
  addBreadcrumb: () => {},
  configureScope: () => {},
};

export default SentryWeb;
