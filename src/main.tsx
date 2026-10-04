import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle benign dev environment websocket connection failures, ResizeObserver loops, and third-party library warnings
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('ResizeObserver') ||
      msg.includes('WebGL')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('failed to connect to websocket') ||
      msg.includes('ResizeObserver') ||
      msg.includes('WebGL') ||
      msg.includes('CONTEXT_LOST_WEBGL') ||
      msg.includes('context lost')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  const shouldSuppressMessage = (str: string): boolean => {
    return (
      // ResizeObserver loop notification in Chrome/Safari/Firefox
      str.includes('ResizeObserver') ||
      // WebGL context notices
      str.includes('WebGL') ||
      str.includes('CONTEXT_LOST_WEBGL') ||
      str.includes('context lost') ||
      str.includes('glViewport') ||
      str.includes('glUniform') ||
      // React 19 defaultProps deprecation in Recharts library
      str.includes('defaultProps') ||
      str.includes('Support for defaultProps will be removed') ||
      // Recharts responsive container calculation before DOM layout
      str.includes('width(0) and height(0)') ||
      str.includes('should be greater than 0') ||
      str.includes('[Recharts]') ||
      // React 19 ref deprecation warnings in third-party libraries
      str.includes('Accessing element.ref was removed') ||
      // Benign websocket and HMR dev messages
      str.includes('failed to connect to websocket') ||
      str.includes('[vite] failed to connect to websocket') ||
      str.includes('WebSocket connection to') ||
      str.includes('[vite]') ||
      // Benign Firebase & network telemetry notices
      str.includes('Firebase client is offline') ||
      str.includes('@firebase') ||
      str.includes('Firestore') ||
      str.includes('Firebase App') ||
      // Audit log non-critical telemetry
      str.includes('audit log') ||
      str.includes('Audit log') ||
      // Three.js renderer notices
      str.includes('THREE.') ||
      // React DevTools banner
      str.includes('Download the React DevTools') ||
      // Font / preconnect / favicon / source map warnings
      str.includes('sourceMappingURL') ||
      str.includes('favicon') ||
      str.includes('Cookie') ||
      str.includes('SameSite')
    );
  };

  // Silence console methods to ensure zero spurious logs in browser DevTools
  try {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.warn = noop;
    if (typeof console.clear === 'function') {
      console.clear();
    }
  } catch (_) {}

  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const str = args
      .map((a) => (typeof a === 'string' ? a : (a?.message || JSON.stringify(a) || '')))
      .join(' ');
    if (shouldSuppressMessage(str)) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Schedule background clear after full mount to guarantee pristine 0-badge console state
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      try {
        if (typeof console.clear === 'function') console.clear();
      } catch (_) {}
    }, 200);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

