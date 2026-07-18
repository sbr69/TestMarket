import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Buffer} from 'buffer';
import App from './App.tsx';
import './index.css';

// Required by Stellar Wallets Kit dependencies in browsers. This runs before
// React loads any lazy wallet route, while Vite injects the same value inside
// the production wallet bundle.
const browserGlobal = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
browserGlobal.Buffer ??= Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
