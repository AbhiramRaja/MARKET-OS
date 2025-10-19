import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import DriversPage from './pages/DriversPage';
import Login from './pages/Login';

// Configure Amplify
Amplify.configure(awsExports);

export default function App() {
  return (
    <Authenticator.Provider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<DriversPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Authenticator.Provider>
  );
}
