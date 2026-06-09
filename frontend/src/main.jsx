import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorBoundary, initErrorReporter } from './lib/errorReporter.js'
import './index.css'

initErrorReporter()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<main className="auth-page"><section className="auth-card"><h1>Something went wrong</h1><p>Refresh the page or contact support if this continues.</p></section></main>}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
