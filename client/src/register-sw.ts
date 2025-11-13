// Service Worker Registration
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      if (import.meta.env.DEV) {
        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);
      }
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (import.meta.env.DEV) {
          console.log('[PWA] Nova versão encontrada, atualizando...');
        }
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              if (confirm('Nova versão disponível! Recarregar agora?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('[PWA] Erro ao registrar Service Worker:', error);
    }
  } else {
    if (import.meta.env.DEV) {
      console.log('[PWA] Service Workers não são suportados neste navegador');
    }
  }
}

// Install prompt
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let deferredPrompt: any; // BeforeInstallPromptEvent type is not widely supported

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    if (import.meta.env.DEV) {
      console.log('[PWA] Prompt de instalação disponível');
    }
    
    // Show custom install button or UI
    showInstallPromotion();
  });
  
  window.addEventListener('appinstalled', () => {
    if (import.meta.env.DEV) {
      console.log('[PWA] App instalado com sucesso!');
    }
    deferredPrompt = null;
  });
}

export async function promptInstall() {
  if (!deferredPrompt) {
    if (import.meta.env.DEV) {
      console.log('[PWA] Prompt de instalação não disponível');
    }
    return false;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond
  const { outcome } = await deferredPrompt.userChoice;
  if (import.meta.env.DEV) {
    console.log(`[PWA] Resposta do usuário: ${outcome}`);
  }
  
  // Clear the prompt
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

function showInstallPromotion() {
  // You can show a custom install button here
  // For example, show a banner or button that calls promptInstall()
  if (import.meta.env.DEV) {
    console.log('[PWA] Mostrando promoção de instalação...');
  }
}
