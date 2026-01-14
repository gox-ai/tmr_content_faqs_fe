import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 3000,
      allowedHosts: ["tools.twominutereports.com", "twominutereports.com"],
    },
    define: {
      "import.meta.env.REACT_APP_API_URL": JSON.stringify(
        env.REACT_APP_API_URL || ""
      ),
    },
    envPrefix: ["VITE_", "REACT_APP_"],
  };
});
