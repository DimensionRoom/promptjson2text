'use client';
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #0b0c10;
    --card: #111218;
    --text: #e6e8ee;
    --muted: #a6adbb;
    --accent: #6ea8fe;
    --accent-2: #7ee787;
    --danger: #ff6b6b;
    --border: #1a1d24;
  }
  * { box-sizing: border-box; }
  body {
    background: radial-gradient(1200px 800px at 80% -10%, #111427, transparent),
      linear-gradient(180deg, #0b0c10, #0b0c10);
    color: var(--text);
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial;
  }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
  textarea { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
`;
