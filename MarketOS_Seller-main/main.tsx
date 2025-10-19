import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { ApolloProvider } from '@apollo/client'
import { apollo } from './apollo'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apollo}><App/></ApolloProvider>
  </React.StrictMode>
)
