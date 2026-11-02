
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

// ======================================================
// APPLICATION ENTRY POINT
// Injibara Campus Lost & Found Admin Web
// ======================================================

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Check admin-web/index.html.',
  );
}

// ======================================================
// RENDER APPLICATION
// ======================================================

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
