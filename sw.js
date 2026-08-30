// Service worker mínimo — solo existe para que el navegador permita instalar la app.
// No cachea nada todavía (eso podría agregarse después para uso sin internet).
self.addEventListener('fetch', () => {});
