import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Keep local preferences and drafts between app launches. The previous clean-start
// routine cleared localStorage on every load, which prevented Android/Web users
// from retaining their local settings.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
