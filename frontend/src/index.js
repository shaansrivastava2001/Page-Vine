import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactDOM from 'react-dom/client';
import App from './App';
import { scheduleAutoLogout } from './utils/auth';
// Importing appAxios here installs the global request/response interceptors
// (loader counter + 401 → logout) at app boot, even if no service has been
// imported yet by the first rendered route.
import './services/appAxios';

// Start the expiry timer if a session is still on disk.
scheduleAutoLogout();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode> 
);

