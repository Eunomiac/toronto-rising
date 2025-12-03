import { defineConfig } from "vite";

/**
 * Vite plugin to remove debug buttons from HTML during production builds
 * Removes elements with IDs "pause-btn" and "debug-btn"
 */
function removeDebugButtons() {
  return {
    name: "remove-debug-buttons",
    transformIndexHtml(html) {
      // Only remove buttons in production builds
      if (process.env.NODE_ENV === "production") {
        // Remove pause button
        html = html.replace(/<button[^>]*id=["']pause-btn["'][^>]*>.*?<\/button>/gs, "");
        // Remove debug button
        html = html.replace(/<button[^>]*id=["']debug-btn["'][^>]*>.*?<\/button>/gs, "");
      }
      return html;
    },
  };
}

export default defineConfig({
  base: "/toronto-rising/",
  plugins: [removeDebugButtons()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
