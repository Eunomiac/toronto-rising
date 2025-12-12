import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Strips comments from JSONC (JSON with Comments) content
 * Properly handles comments inside strings (e.g., URLs like http://example.com)
 * @param {string} content - JSONC content with comments
 * @returns {string} - JSON content without comments
 */
function stripJsoncComments(content) {
  let result = "";
  let i = 0;
  let inString = false;
  let stringChar = null; // '"' or "'"
  let escaped = false;

  while (i < content.length) {
    const char = content[i];
    const nextChar = i + 1 < content.length ? content[i + 1] : null;

    if (escaped) {
      // We're in an escaped sequence, add the character and reset escaped flag
      result += char;
      escaped = false;
      i++;
      continue;
    }

    if (char === "\\") {
      // Escape character - next character is escaped
      escaped = true;
      result += char;
      i++;
      continue;
    }

    if (!inString && (char === '"' || char === "'")) {
      // Entering a string
      inString = true;
      stringChar = char;
      result += char;
      i++;
      continue;
    }

    if (inString && char === stringChar) {
      // Exiting a string
      inString = false;
      stringChar = null;
      result += char;
      i++;
      continue;
    }

    if (inString) {
      // We're inside a string, just add the character
      result += char;
      i++;
      continue;
    }

    // We're outside a string, check for comments
    if (char === "/" && nextChar === "/") {
      // Single-line comment - skip until end of line
      while (i < content.length && content[i] !== "\n" && content[i] !== "\r") {
        i++;
      }
      // Include the newline character
      if (i < content.length && (content[i] === "\n" || content[i] === "\r")) {
        result += content[i];
        if (content[i] === "\r" && i + 1 < content.length && content[i + 1] === "\n") {
          i++; // Skip \n in \r\n
          result += content[i];
        }
        i++;
      }
      continue;
    }

    if (char === "/" && nextChar === "*") {
      // Multi-line comment - skip until */
      i += 2; // Skip /*
      while (i < content.length) {
        if (content[i] === "*" && i + 1 < content.length && content[i + 1] === "/") {
          i += 2; // Skip */
          break;
        }
        i++;
      }
      continue;
    }

    // Regular character, add it
    result += char;
    i++;
  }

  return result;
}

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

        // Remove comments while respecting string boundaries
        content = stripJsoncComments(content);

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
