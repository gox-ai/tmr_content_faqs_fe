import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Anti-clickjacking and baseline hardening headers for the served app.
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 3000,
      allowedHosts: ["tools.twominutereports.com", "twominutereports.com"],
      headers: securityHeaders,
    },
    preview: {
      allowedHosts: ["tools.twominutereports.com", "twominutereports.com"],
      headers: securityHeaders,
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL || ""),
    },
    envPrefix: ["VITE_", "REACT_APP_"],
  };
});
