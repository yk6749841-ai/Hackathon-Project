import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'

// החליפי את המחרוזת למטה ב-Client ID שקיבלת מ-Google Cloud Console
const GOOGLE_CLIENT_ID = "920520473791-sec57ti3a631ebfqce4l7vmj4bdtaipl.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
