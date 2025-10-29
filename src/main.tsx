import './index.css';
// Prevent "Can't find variable: process" in browser
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
