import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// Ensure Amplify is configured before any services that import Amplify APIs
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

import App from './App.jsx';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
