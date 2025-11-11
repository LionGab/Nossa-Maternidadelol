/**
 * Sentry Configuration
 * Error tracking e performance monitoring
 * Suporta React Native e Web
 *
 * No web, usa stub; no mobile, usa @sentry/react-native
 */

let Sentry: any;
let isInitialized = false;

// Importação condicional baseada na plataforma
// O Metro resolverá automaticamente para sentry.web.ts no web
const isWeb = typeof window !== 'undefined' && window.navigator;

if (isWeb) {
  // Ambiente web - usar stub
  Sentry = require('./sentry.web').default;
} else {
  // Ambiente mobile - usar @sentry/react-native
  try {
    Sentry = require('@sentry/react-native');
  } catch (error) {
    console.warn('Sentry não disponível, usando stub:', error);
    Sentry = require('./sentry.web').default;
  }
}

export function initSentry() {
  if (isInitialized) {
    return;
  }

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN não configurado. Error tracking desabilitado.');
    return;
  }

  // Apenas inicializar no mobile (React Native)
  if (isWeb) {
    console.log('Sentry: Inicialização pulada no ambiente web');
    return;
  }

  try {
    Sentry.init({
      dsn,
      debug: false,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV || 'development',
      enableNative: true,
      enableNativeNagger: false,
      beforeSend(event: any, hint: any) {
        // Filtrar erros sensíveis ou não importantes
        if (event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as Error).message;
            // Não enviar erros de rede esperados
            if (message.includes('Network request failed')) {
              return null;
            }
          }
        }
        return event;
      },
    });

    isInitialized = true;
    console.log('Sentry inicializado com sucesso');
  } catch (error) {
    console.warn('Erro ao inicializar Sentry:', error);
  }
}

export default Sentry;
