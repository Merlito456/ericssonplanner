
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Polyfill process.env for browser environments where it might be missing
// Fix: Use type assertion to avoid "Property 'process' does not exist on type 'Window'" TypeScript error
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical Error: Could not find root element with id 'root'.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render the application:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
        <h2 style="margin-top: 0;">Application Error</h2>
        <p>The application failed to start. Please check the browser console for details.</p>
      </div>
    `;
  }
}
