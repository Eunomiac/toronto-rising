import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Strips comments from JSONC (JSON with Comments) content
 * @param {string} content - JSONC content with comments
 * @returns {string} - JSON content without comments
 */
function stripJsoncComments(content) {
  // Remove single-line comments (// ...)
  content = content.replace(/\/\/.*$/gm, "");

  // Remove multi-line comments (/* ... */)
  content = content.replace(/\/\*[\s\S]*?\*\//g, "");

  return content;
}

/**
 * Extracts all HTML tags (including attributes) from a string
 * @param {string} text - Text to scan for HTML tags
 * @returns {Set<string>} - Set of unique HTML tags found
 */
function extractHtmlTags(text) {
  const tags = new Set();

  if (typeof text !== "string") {
    return tags;
  }

  // Regex to match HTML tags including attributes
  // Matches: <tag>, <tag attr="value">, <tag class='value'>, etc.
  // Also matches self-closing tags: <br/>, <img src="..."/>, etc.
  const tagRegex = /<[^>]+>/g;

  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    const tag = match[0];
    tags.add(tag);
  }

  return tags;
}

/**
 * Recursively extracts HTML tags from an object (keys and all string values)
 * @param {any} obj - Object to scan
 * @param {Set<string>} allTags - Set to collect unique tags
 */
function scanObjectForTags(obj, allTags) {
  if (typeof obj === "string") {
    const tags = extractHtmlTags(obj);
    tags.forEach(tag => allTags.add(tag));
  } else if (Array.isArray(obj)) {
    obj.forEach(item => scanObjectForTags(item, allTags));
  } else if (obj !== null && typeof obj === "object") {
    // Scan keys
    Object.keys(obj).forEach(key => {
      const keyTags = extractHtmlTags(key);
      keyTags.forEach(tag => allTags.add(tag));
    });

    // Scan values
    Object.values(obj).forEach(value => {
      scanObjectForTags(value, allTags);
    });
  }
}

/**
 * Main function to scan the JSON file for HTML tags
 */
function scanJsonForHtmlTags() {
  const jsonPath = path.join(__dirname, "data", "vtm-rumors.jsonc");

  console.log("Reading JSONC file...");
  const jsonContent = fs.readFileSync(jsonPath, "utf8");

  console.log("Stripping comments and parsing JSON...");
  const jsonWithoutComments = stripJsoncComments(jsonContent);
  const data = JSON.parse(jsonWithoutComments);

  console.log("Scanning for HTML tags...");
  const allTags = new Set();

  scanObjectForTags(data, allTags);

  // Convert to sorted array for consistent output
  const sortedTags = Array.from(allTags).sort();

  console.log("\n=== Unique HTML Tags Found ===\n");
  if (sortedTags.length === 0) {
    console.log("No HTML tags found.");
  } else {
    sortedTags.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag}`);
    });
    console.log(`\nTotal: ${sortedTags.length} unique tag(s)`);
  }

  return sortedTags;
}

// Run the scan
scanJsonForHtmlTags();
