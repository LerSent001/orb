import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), react()],
  build: {
    rolldownOptions: {
      input: {
        editor: fileURLToPath(new URL("./index.html", import.meta.url)),
        voiceAgent: fileURLToPath(new URL("./examples/voice-agent/index.html", import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
