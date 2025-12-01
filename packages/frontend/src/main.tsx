import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { registerSW } from 'virtual:pwa-register';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

// Register service worker with update prompt
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
