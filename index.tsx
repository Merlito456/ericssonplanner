
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

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
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
          <h2 style="margin-top: 0;">Application Error</h2>
          <p>The application failed to start. This is likely due to a configuration issue in the deployment environment.</p>
          <pre style="font-size: 12px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      `;
    }
  }
}
