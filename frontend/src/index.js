import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installAuthInterceptors, scheduleAutoLogout } from './utils/auth';

// Catch 401/403 globally + start the expiry timer if a session is still on disk.
installAuthInterceptors();
scheduleAutoLogout();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode> 
);

