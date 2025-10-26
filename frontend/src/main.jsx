import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Amplify } from 'aws-amplify'

// Configure Amplify with Cognito (allow unauthenticated access)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      allowGuestAccess: true, // Enable guest/unauthenticated access
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
