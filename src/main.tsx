import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Remove any service worker or browser cache left by the previous FNI design.
// This is a one-time clean start; the app currently stores no account data.
async function clearPreviousAppState() {
  const reloadKey = 'fni-clean-start-reloaded';
  const alreadyReloaded = sessionStorage.getItem(reloadKey) === '1';

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }

  if (!alreadyReloaded && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(reloadKey, '1');
    window.location.reload();
    return false;
  }

  localStorage.clear();
  sessionStorage.clear();
  return true;
}

void clearPreviousAppState().then((ready) => {
  if (!ready) return;
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode><App /></React.StrictMode>,
  );
});
