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
 * Extracts content from a span tag and removes it from the text
 * @param {string} text - Text containing the span tag
 * @param {string} className - Class name to match (e.g., 'date-line' or 'subtitle')
 * @returns {Object} - Object with extracted content and cleaned text
 */
function extractSpanContent(text, className) {
  // Match: <span class='className'>content</span>
  // Handles both single and double quotes
  const regex = new RegExp(`<span class=['"]${className}['"]>([^<]*)</span>`, "g");

  let extractedContent = null;
  let cleanedText = text;
  let match;

  // Find all matches and extract content
  while ((match = regex.exec(text)) !== null) {
    if (extractedContent === null) {
      // Take the first match's content
      extractedContent = match[1];
    }
    // Remove the tag from the text
    cleanedText = cleanedText.replace(match[0], "");
  }

  return {
    content: extractedContent,
    cleanedText: cleanedText.trim()
  };
}

/**
 * Processes a single rumor entry
 * @param {string} key - The original key
 * @param {Object} value - The value object
 * @returns {Object} - Object with new key and updated value
 */
function processRumorEntry(key, value) {
  let newKey = key;
  let newValue = { ...value };

  // Process date-line spans first (they take priority)
  const dateLineResult = extractSpanContent(newKey, "date-line");
  if (dateLineResult.content !== null) {
    newKey = dateLineResult.cleanedText;
    newValue.subtitle = dateLineResult.content;
    newValue.subtitleClass = "date-line";
  }

  // Also check content property for date-line
  if (newValue.content && typeof newValue.content === "string") {
    const contentDateLineResult = extractSpanContent(newValue.content, "date-line");
    if (contentDateLineResult.content !== null) {
      newValue.content = contentDateLineResult.cleanedText;
      // If subtitle wasn't set from key, set it from content
      if (!newValue.subtitle) {
        newValue.subtitle = contentDateLineResult.content;
        newValue.subtitleClass = "date-line";
      }
    }
  }

  // Process subtitle spans (only if date-line wasn't found)
  if (!newValue.subtitle || newValue.subtitleClass !== "date-line") {
    const subtitleResult = extractSpanContent(newKey, "subtitle");
    if (subtitleResult.content !== null) {
      newKey = subtitleResult.cleanedText;
      newValue.subtitle = subtitleResult.content;
      // Only set subtitleClass if it wasn't already set to "date-line"
      if (newValue.subtitleClass !== "date-line") {
        newValue.subtitleClass = "";
      }
    }

    // Also check content property for subtitle
    if (newValue.content && typeof newValue.content === "string") {
      const contentSubtitleResult = extractSpanContent(newValue.content, "subtitle");
      if (contentSubtitleResult.content !== null) {
        newValue.content = contentSubtitleResult.cleanedText;
        // If subtitle wasn't set from key, set it from content
        if (!newValue.subtitle) {
          newValue.subtitle = contentSubtitleResult.content;
          newValue.subtitleClass = "";
        }
      }
    }
  }

  return {
    key: newKey,
    value: newValue
  };
}

/**
 * Main function to process the JSON file
 */
function extractHtmlTagsFromJson() {
  const jsonPath = path.join(__dirname, "data", "vtm-rumors.jsonc");
  const outputPath = path.join(__dirname, "data", "vtm-rumors-extracted.json");

  console.log("Reading JSONC file...");
  const jsonContent = fs.readFileSync(jsonPath, "utf8");

  console.log("Stripping comments and parsing JSON...");
  const jsonWithoutComments = stripJsoncComments(jsonContent);
  const data = JSON.parse(jsonWithoutComments);

  console.log("Processing entries...");
  const processedData = {};
  let processedCount = 0;

  for (const [key, value] of Object.entries(data)) {
    const processed = processRumorEntry(key, value);
    processedData[processed.key] = processed.value;

    if (processed.key !== key || JSON.stringify(processed.value) !== JSON.stringify(value)) {
      processedCount++;
      console.log(`  Processed: "${key}" -> "${processed.key}"`);
    }
  }

  console.log(`\nProcessed ${processedCount} entries with HTML tags.`);

  console.log("Writing output file...");
  fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2), "utf8");

  console.log(`\nDone! Output written to: ${outputPath}`);
  console.log("Review the file and replace the original when ready.");

  return processedData;
}

// Run the extraction
extractHtmlTagsFromJson();
