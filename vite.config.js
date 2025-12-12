import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";

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

/**
 * Vite plugin to handle JSONC (JSON with Comments) files
 * Strips comments and line comments from JSONC files before parsing
 */
function jsoncPlugin() {
  return {
    name: "jsonc-loader",
    load(id) {
      if (id.endsWith(".jsonc")) {
        const filePath = resolve(id);
        let content = readFileSync(filePath, "utf-8");

        // Remove single-line comments (// ...)
        content = content.replace(/\/\/.*$/gm, "");

        // Remove multi-line comments (/* ... */)
        content = content.replace(/\/\*[\s\S]*?\*\//g, "");

        // Parse as JSON
        try {
          const json = JSON.parse(content);
          return `export default ${JSON.stringify(json, null, 2)}`;
        } catch (error) {
          throw new Error(`Failed to parse JSONC file ${id}: ${error.message}`);
        }
      }
    },
  };
}

export default defineConfig({
  base: "/toronto-rising/",
  plugins: [removeDebugButtons(), jsoncPlugin()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
