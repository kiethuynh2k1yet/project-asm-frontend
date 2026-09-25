'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* =========================
     1. Reset box model
  ========================== */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* =========================
     2. Reset spacing cơ bản
  ========================== */
  * {
    margin: 0;
    padding: 0;
  }

  /* =========================
     3. HTML / Body
  ========================== */
  html {
    font-size: 62.5%;
    scroll-behavior: smooth;
  }

  body {
    min-width: 320px;
    min-height: 100vh;
    overflow-x: hidden;

    font-family: var(--font-poppins), sans-serif;
    font-size: 1.6rem;
    line-height: 1.5;
    font-weight: 400;

    color: #1f2937;
    background-color: #ffffff;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* =========================
     4. Text elements
  ========================== */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: inherit;
    font-weight: inherit;
  }

  /* =========================
     5. Lists
  ========================== */
  ul,
  ol {
    list-style: none;
  }

  /* =========================
     6. Links
  ========================== */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* =========================
     7. Images / Media
  ========================== */
  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }

  img {
    height: auto;
  }

  /* =========================
     8. Form controls
  ========================== */
  input,
  button,
  textarea,
  select {
    color: inherit;
    font: inherit;
  }

  input,
  textarea {
    border-radius: 0;
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  textarea {
    resize: vertical;
  }

  input:focus,
  textarea:focus,
  select:focus,
  button:focus {
    outline: none;
  }

  :focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 3px;
  }

  /* =========================
     9. Table
  ========================== */
  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  /* =========================
     10. Scrollbar
  ========================== */
  * {
    scrollbar-width: thin;
    scrollbar-color: #b6bcc5 transparent;
  }

  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-track {
    background: transparent;
  }

  *::-webkit-scrollbar-thumb {
    background-color: #b6bcc5;
    border-radius: 999px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background-color: #8d96a3;
  }

  /* =========================
     11. Selection text
  ========================== */
  ::selection {
    color: #ffffff;
    background-color: #2563eb;
  }
`;