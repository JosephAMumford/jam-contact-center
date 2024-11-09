import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config(); // load env vars from .env

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
