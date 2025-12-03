import { gsap } from "gsap";
import rumorsData from "../data/vtm-rumors.json";
import "./styles.scss";

// Ensure background video plays
const backgroundVideo = document.getElementById("background-video");
if (backgroundVideo) {
  backgroundVideo.addEventListener("loadeddata", () => {
    backgroundVideo.play().catch((error) => {
      console.warn("Video autoplay failed:", error);
    });
  });

  backgroundVideo.addEventListener("error", (e) => {
    console.error("Video loading error:", e);
  });
}

// All blocks start at bottom-left and move to upper-right

/**
 * Animation configuration - adjust these values to tweak timing and effects
 */
/**
 * Animation Registry - Class-based animation overrides
 * Structure: ANIMATION_REGISTRY[className][componentType] = function that returns a GSAP timeline
 *
 * Function signature: (words/element, element, masterLabels, classes, timing) => GSAP.Timeline
 *
 * Parameters:
 *   - words/element: For word animations: NodeList of word elements. For images: the image element
 *   - element: The parent element (e.g., .rumor-title, or same as first param for images)
 *   - masterLabels: Object with label times { componentFadeInStart, componentFadeOutEnd, ... }
 *   - classes: Array of CSS classes applied to the element
 *   - timing: Object with timing data:
 *     {
 *       fadeInStart: number,         // Absolute time when content words start fading in (0% of totalDuration)
 *       fadeInDuration: number,      // Duration from fadeInStart to fadeInComplete (typically ~5-15% of totalDuration)
 *       fadeInComplete: number,      // Absolute time when all fade-in animations complete (early in timeline, ~5-15%)
 *       holdStart: number,           // Absolute time when the hold period begins (same as fadeInComplete)
 *       holdDuration: number,        // Duration of the hold period from holdStart to holdComplete (varies based on content length)
 *       holdComplete: number,        // Absolute time when the hold period ends (same as fadeOutStart)
 *       fadeOutStart: number,        // Absolute time when content words start fading out (100% - fadeOutDuration)
 *       fadeOutDuration: number,     // Duration of content fade-out animation (typically ~10-20% of totalDuration)
 *       fadeOutEnd: number,          // Absolute time when content words finish fading out (100% of totalDuration)
 *       totalDuration: number        // Duration from fadeInStart to fadeOutEnd (the stretched duration)
 *     }
 *     Note: Percentages are relative to totalDuration (from fadeInStart to fadeOutEnd).
 *     The position of fadeOutStart varies based on hold duration, which is dynamically calculated
 *     from content length (if useDynamicCalculation is enabled) or uses a fixed duration. Since
 *     fadeOutEnd = fadeOutStart + fadeOutDuration, fadeOutStart is always positioned fadeOutDuration
 *     before the end (e.g., if fadeOutDuration is 20% of totalDuration, fadeOutStart is at 80%).
 *
 * The function should return a GSAP timeline. The timeline will be automatically
 * stretched (via timeScale) to fit between the master timeline labels.
 *
 * Example - blood-god title animation:
 */
function prepareFixedTimeline(timingData) {
  return gsap.timeline({
    onStart: () => {
      timingData.startTime = gsap.globalTimeline.time();
      console.log(`Child Timeline START: 0`);
    },
    onComplete: () => {
      console.log(`Child Timeline COMPLETE: ${gsap.globalTimeline.time() - timingData.startTime}`);
    }
  }).to({}, {duration: 100});
}
const ANIMATION_REGISTRY = {
  "blood-god": {
    title: (words, element, masterLabels, classes) => {
      const child = gsap.timeline();

      // Set configurable values
      const startingScale = 2.0;
      const fadeInDuration = 0.6;
      const fadeOutDuration = 0.5;


      // Set initial state: scaled up and transparent
      gsap.set(words, {
        opacity: 0,
        scale: startingScale,
        y: 0,
      });

      // Set initial background opacity to 0
      gsap.set(element, {
        "--bg-opacity": 0,
      });

      // Fade in and scale down animation
      child.to(words, {
        opacity: 1,
        scale: 1,
        duration: fadeInDuration,
        ease: "power2.out",
        stagger: 0.05,
      }, 0.2);

      // Calculate when fade-in completes
      const totalFadeInDuration = fadeInDuration + (words.length * 0.05);
      const fadeInEndTime = 0.2 + totalFadeInDuration;

      // Background fade-in starts at 75% through fade-in
      const backgroundStartTime = 0.2 + (totalFadeInDuration * 0.75);
      const backgroundDuration = fadeInEndTime - backgroundStartTime;

      // Animate background opacity
      child.to(element, {
        "--bg-opacity": 1,
        duration: backgroundDuration,
        ease: "power2.out",
      }, "<25%");

      // Fade out animation
      child.to(words, {
        opacity: 0,
        scale: 0.8,
        duration: fadeOutDuration,
        ease: "power2.in",
        stagger: 0.04,
      }, fadeInEndTime);

      // Fade out background
      child.to(element, {
        "--bg-opacity": 0,
        duration: fadeOutDuration / 2,
        ease: "power2.in",
      }, fadeInEndTime);

      return child;
    },
  },
  "animate-slide-down": {
    image: (image, element, masterLabels, classes, timing) => {
      const timingData = {startTime: 0};
      const child = prepareFixedTimeline(timingData);

      // Set configurable values
      const startingXPercent = -180; // translate(-80%, 100%)
      const endingXPercent = 130;
      const startingYPercent = -175; // translate(-180%, 50%)
      const endingYPercent = -25;

      // Duration values, as percentages of 100
      const fadeInDuration = 35;
      const fadeOutDuration = 35;

      gsap.set(image, {
        opacity: 0,
        scale: 0.5,
        filter: "brightness(0.25)"
      });

      // Start fading in about 5% into master timeline
      child.to(image, {
        opacity: 1,
        scale: 1,
        filter: "brightness(1)",
        duration: fadeInDuration,
        ease: "none",
        onStart: () => {
          console.log(`Child Timeline Fade-In START: ${gsap.globalTimeline.time() - timingData.startTime}`);
        },
        onComplete: () => {
          console.log(`Child Timeline Fade-In COMPLETE: ${gsap.globalTimeline.time() - timingData.startTime}`);
        }
      }, 5);

      // Slide animation, which should span the full length of the master timeline
      child.fromTo(image, {
        xPercent: startingXPercent,
        yPercent: startingYPercent
      }, {
        xPercent: endingXPercent,
        yPercent: endingYPercent,
        duration: 100,
        ease: "none",
        onStart: () => {
          console.log(`Child Timeline Slide START: ${gsap.globalTimeline.time() - timingData.startTime}`);
        },
        onComplete: () => {
          console.log(`Child Timeline Slide COMPLETE: ${gsap.globalTimeline.time() - timingData.startTime}`);
        }
      }, 0);

      // Start fading out as soon as the rest of the content has finished fading in
      child.to(image, {
        opacity: 0,
        scale: 0.5,
        filter: "brightness(0.25)",
        duration: fadeOutDuration,
        ease: "none",
        onStart: () => {
          console.log(`Child Timeline Fade-Out START: ${gsap.globalTimeline.time() - timingData.startTime}`);
        },
        onComplete: () => {
          console.log(`Child Timeline Fade-Out COMPLETE: ${gsap.globalTimeline.time() - timingData.startTime}`);
        }
      }, timing.fadeOutStart + 10);

      return child;
    }
  }
};

/**
 * Default animations for each component type
 * Used when no class-specific animation is found
 */
const DEFAULT_ANIMATIONS = {
  surtitle: {
    fadeIn: {
      duration: 0.3,
      stagger: 0.02,
      delay: 0.05,
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.4,
      stagger: 0.03,
      y: -20,
      ease: "power2.in",
    },
  },
  title: {
    fadeIn: {
      duration: 0.35,
      stagger: 0.025,
      delay: 0.1,
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.5,
      stagger: 0.04,
      y: -20,
      ease: "power2.in",
    },
  },
  subtitle: {
    fadeIn: {
      duration: 0.3,
      stagger: 0.02,
      delay: 0.2,
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.4,
      stagger: 0.03,
      y: -20,
      ease: "power2.in",
    },
  },
  content: {
    fadeIn: {
      duration: 0.4,
      stagger: 0.015,
      delay: 0.25,
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.6,
      stagger: 0.02,
      y: -20,
      ease: "power2.in",
    },
  },
};

const ANIMATION_CONFIG = {
  globalTimeScale: 0.75, // Global time scale for all animations
  // Display duration - how long the blurb stays visible after fade-in completes
  displayDuration: {
    holdDurationMs: 12000, // How long to hold text visible after animations complete (in milliseconds)
    // Optional: dynamic calculation based on content length
    // Set to null to disable dynamic calculation
    baseTimeMs: 8000, // Minimum display time if using dynamic calculation
    multiplierMs: 400, // Milliseconds per content unit (line or word) if using dynamic calculation
    useDynamicCalculation: true, // Set to true to calculate based on content length
  },

  // Initial word state
  initialState: {
    opacity: 0,
    y: 20, // Vertical offset for fade-in
  },

  // Surtitle word animations
  surtitle: {
    fadeIn: {
      duration: 0.5,
      stagger: 0.04,
      delay: 0.1, // Delay before starting animation
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.4,
      stagger: 0.03,
      y: -20, // Vertical offset for fade-out
      ease: "power2.in",
    },
  },

  // Title word animations
  title: {
    fadeIn: {
      duration: 0.6,
      stagger: 0.05, // Delay between each word
      delay: 0.2, // Delay before starting animation
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.5,
      stagger: 0.04,
      y: -20, // Vertical offset for fade-out
      ease: "power2.in",
    },
  },

  // Subtitle word animations
  subtitle: {
    fadeIn: {
      duration: 0.5,
      stagger: 0.04,
      delay: 0.4, // Delay after title starts
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.4,
      stagger: 0.03,
      y: -20, // Vertical offset for fade-out
      ease: "power2.in",
    },
  },

  // Image animations - placeholder for customization
  images: {
    fadeIn: {
      duration: 0.6,
      delay: 0.3,
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.4,
      ease: "power2.in",
    },
    // Custom animations can be defined per image class
    customAnimations: {
      // Example: "float-left" class could have different animation
      // "float-left": { fadeIn: { duration: 0.8, ease: "elastic.out" } }
    },
  },

  // Content word animations
  content: {
    fadeIn: {
      duration: 0.8,
      stagger: 0.03,
      delay: 0.5, // Delay after title starts
      ease: "power2.out",
    },
    fadeOut: {
      duration: 0.6,
      stagger: 0.02,
      y: -20,
      ease: "power2.in",
    },
  },

  // Container animations
  container: {
    fadeOutDuration: 0.3,
    // Smoky fade effects
    fadeIn: {
      blur: 15, // Initial blur amount (pixels)
      brightness: 0.3, // Initial brightness (0-1, lower = darker)
      scale: 0.35, // Initial scale
      duration: 1.2, // Duration to clear the smoky effect
    },
    fadeOut: {
      blur: 20, // Final blur amount (pixels)
      brightness: 0.2, // Final brightness (0-1, lower = darker)
      scale: 0.25, // Final scale (slightly smaller as it sinks)
      duration: 0.8, // Duration to fade back into smoke
    },
  },

  // Transition between rumors
  transition: {
    nextRumorDelayMs: 500, // Delay before loading next rumor
  },

  // Progressive line shifting
  lineShift: {
    enabled: false, // Enable progressive left shift for each line
    shiftAmount: -1.5, // Amount to shift each line relative to center (in rem)
    shiftAmountMobile: -1.0, // Amount to shift on mobile (in rem)
    yPositionTolerance: 3, // Pixels - words within this range are considered on the same line
  },

  // HTML parsing
  htmlParsing: {
    enabled: true, // Set to true to parse JSON text as raw HTML, false to escape HTML
  },
};

/**
 * Gets custom animation function for a component, checking class-based overrides first
 * @param {string} componentType - Component type ("surtitle", "title", "subtitle", "content")
 * @param {Array<string>} classes - Array of CSS classes applied to the element
 * @returns {Function|null} - Custom animation function, or null if not found
 */
function getCustomAnimationFunction(componentType, classes) {
  // Check each class for matching animation override
  if (classes && classes.length > 0) {
    for (const className of classes) {
      if (ANIMATION_REGISTRY[className] && ANIMATION_REGISTRY[className][componentType]) {
        const anim = ANIMATION_REGISTRY[className][componentType];
        // Check if it's a function (custom timeline) or config object (legacy)
        if (typeof anim === "function") {
          return anim;
        }
      }
    }
  }
  return null;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - A new shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Splits text nodes into words wrapped in spans, preserving HTML structure
 * @param {Node} node - DOM node to process
 * @returns {void} - Modifies the node in place
 */
function splitTextNodeIntoWords(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const words = text.split(/(\S+)(\s*)/g).filter((part) => part.length > 0);

    // Create a document fragment to hold the new nodes
    const fragment = document.createDocumentFragment();

    words.forEach((word) => {
      if (word.trim().length > 0) {
        // It's a word - wrap in span
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = word;
        fragment.appendChild(span);
      } else {
        // It's whitespace - preserve as text node
        fragment.appendChild(document.createTextNode(word));
      }
    });

    // Replace the original text node with the fragment
    node.parentNode.replaceChild(fragment, node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Recursively process child nodes
    // Use Array.from to create a static copy since we're modifying the live NodeList
    const children = Array.from(node.childNodes);
    children.forEach((child) => {
      splitTextNodeIntoWords(child);
    });
  }
}

/**
 * Splits text into words wrapped in spans for animation, preserving HTML tags
 * @param {string} text - Text to split (may contain HTML)
 * @returns {string} - HTML string with words wrapped in spans
 */
function splitIntoWords(text) {
  if (ANIMATION_CONFIG.htmlParsing.enabled) {
    // HTML-aware mode: parse HTML, split text nodes into words, preserve tags
    const tempDiv = document.createElement("div");
    // Convert markdown emphasis first, then decode HTML entities
    const markdownConverted = convertMarkdownEmphasis(text);
    tempDiv.innerHTML = decodeHtmlEntities(markdownConverted);

    // Process all text nodes to split into words
    splitTextNodeIntoWords(tempDiv);

    return tempDiv.innerHTML;
  } else {
    // Safe mode: convert markdown, decode HTML entities, then escape to prevent XSS
    const markdownConverted = convertMarkdownEmphasis(text);
    const decoded = decodeHtmlEntities(markdownConverted);
    const escaped = escapeHtml(decoded);
    // Split by word boundaries, preserving spaces
    // Match words (including punctuation attached to words) and preserve spaces
    return escaped.replace(/(\S+)(\s*)/g, '<span class="word">$1</span>$2');
  }
}

/**
 * Formats rumor content based on whether it's an array or string
 * @param {string|Array<string>} content - The rumor content
 * @returns {string} - Formatted HTML string
 */
function formatRumorContent(content) {
  if (Array.isArray(content)) {
    return content.map((line) => `<span class="line">${splitIntoWords(line)}</span>`).join("");
  } else {
    return `<p>${splitIntoWords(content)}</p>`;
  }
}

/**
 * Converts markdown-style emphasis (**text**) to HTML span tags
 * @param {string} text - Text that may contain **text** markdown
 * @returns {string} - Text with markdown converted to HTML spans
 */
function convertMarkdownEmphasis(text) {
  // Match **text** and replace with <span class='body-emphasis'>text</span>
  // Use non-greedy matching to handle multiple instances on the same line
  return text.replace(/\*\*(.+?)\*\*/g, "<span class='body-emphasis'>$1</span>");
}

/**
 * Decodes HTML entities (e.g., &mdash; becomes —)
 * @param {string} text - Text with HTML entities
 * @returns {string} - Decoded text
 */
function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Escapes HTML special characters to prevent XSS
 * Note: This should be used after decoding entities if needed
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Creates a shuffled stack of rumor keys
 * @param {Object} data - The rumors data object
 * @returns {Array<string>} - Shuffled array of keys
 */
function createShuffledStack(data) {
  const keys = Object.keys(data);
  return shuffleArray(keys);
}

/**
 * Gets the full rumor object from the data
 * @param {string} key - The rumor key
 * @param {Object} value - The rumor value object
 * @returns {Object} - Object with key and all rumor properties
 */
function getRumorObject(key, value) {
  return {
    key: key,
    title: key, // Title is the key
    ...value, // Include all properties (content, surtitle, subtitle, classes, images, etc.)
  };
}

/**
 * Gets the next rumor from the stack, reshuffling if needed
 * @param {Array<string>} stack - The current stack
 * @param {Object} data - The rumors data object
 * @param {boolean} debugMode - If true, always returns the first rumor
 * @returns {Object} - Object containing the key and all rumor properties
 */

function getNextRumor(stack, data, debugMode = false) {
  if (debugMode) {
    // Debug mode: always return the first rumor
    const firstKey = Object.keys(data)[0];
    return getRumorObject(firstKey, data[firstKey]);
  }

  if (stack.length === 0) {
    // Reshuffle when stack is empty
    stack.push(...createShuffledStack(data));
  }

  const key = stack.pop();
  return getRumorObject(key, data[key]);
}


/**
 * Creates or gets an element, applying classes if provided
 * @param {string} tagName - HTML tag name
 * @param {string} id - Element ID
 * @param {string} baseClass - Base CSS class
 * @param {string} additionalClass - Additional class from JSON (optional)
 * @returns {HTMLElement} - The element
 */
function getOrCreateElement(tagName, id, baseClass, additionalClass = "") {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement(tagName);
    element.id = id;
  }

  // Set classes - combine base class with additional classes
  const classes = [baseClass];
  if (additionalClass) {
    classes.push(...additionalClass.split(" ").filter(c => c.trim()));
  }
  element.className = classes.join(" ");

  return element;
}

/**
 * Removes an element if it exists
 * @param {string} id - Element ID to remove
 */
function removeElementIfExists(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

/**
 * Gets custom animation function for an image based on its classes
 * @param {Array<string>} classes - Array of CSS classes applied to the image
 * @returns {Function|null} - Custom animation function, or null if not found
 */
function getCustomImageAnimationFunction(classes) {
  if (classes && classes.length > 0) {
    for (const className of classes) {
      if (ANIMATION_REGISTRY[className] && ANIMATION_REGISTRY[className].image) {
        const anim = ANIMATION_REGISTRY[className].image;
        if (typeof anim === "function") {
          return anim;
        }
      }
    }
  }
  return null;
}

/**
 * Animates images fade-in based on their classes
 * @param {Array<HTMLElement>} images - Array of image elements
 * @param {GSAP.Timeline} masterTimeline - Master GSAP timeline
 * @param {Object} masterLabels - Object containing master timeline label times
 */
function animateImagesFadeIn(images, masterTimeline, masterLabels, timing = {}) {
  images.forEach((img) => {
    const imgClasses = img.className.split(" ").filter(c => c.trim());
    const customAnimFn = getCustomImageAnimationFunction(imgClasses);

    if (customAnimFn) {
      // Use custom animation function
      // Add the timeline at the content fade-in start label to align with content animations
      const child = customAnimFn(img, img, masterLabels, imgClasses, timing);

      // Stretch the timeline to fit between contentFadeInStart and contentFadeOutEnd
      // (same as word animations)
      const startTime = masterLabels.contentFadeInStart;
      const endTime = masterLabels.contentFadeOutEnd;
      const desiredDuration = endTime - startTime;
      const naturalDuration = child.duration();

      if (desiredDuration > 0 && naturalDuration > 0) {
        const timeScale = naturalDuration / desiredDuration;
        child.timeScale(timeScale);
      }

      // Add to master timeline at content fade-in start (same as content words)
      masterTimeline.add(child, "contentFadeInStart");
    } else {
      // Default fade-in animation - start when content starts
      const animationConfig = ANIMATION_CONFIG.images.fadeIn;

      gsap.set(img, {
        opacity: 0,
      });

      // Start image fade-in at content fade-in start
      masterTimeline.to(img, {
        opacity: 1,
        duration: animationConfig.duration,
        ease: animationConfig.ease,
      }, "contentFadeInStart");
    }
  });
}

/**
 * Animates images fade-out based on their classes
 * @param {Array<HTMLElement>} images - Array of image elements
 * @param {GSAP.Timeline} masterTimeline - Master GSAP timeline
 * @param {Object} masterLabels - Object containing master timeline label times
 */
function animateImagesFadeOut(images, masterTimeline, masterLabels, timing = {}) {
  images.forEach((img) => {
    const imgClasses = img.className.split(" ").filter(c => c.trim());
    const customAnimFn = getCustomImageAnimationFunction(imgClasses);

    if (customAnimFn) {
      // Custom animations handle their own fade-out, so we don't need to do anything here
      // The custom function should handle both fade-in and fade-out
      return;
    } else {
      // Default fade-out animation
      const fadeOutConfig = ANIMATION_CONFIG.images.fadeOut;

      masterTimeline.to(img, {
        opacity: 0,
        duration: fadeOutConfig.duration,
        ease: fadeOutConfig.ease,
      }, "holdComplete");
    }
  });
}

/**
 * Creates a timeline for animating surtitle words
 * @param {NodeList} words - Word elements to animate
 * @param {Object} masterLabels - Object containing master timeline label times
 * @param {Array<string>} classes - CSS classes applied to the surtitle element
 * @returns {GSAP.Timeline} - Child timeline for surtitle animations
 */
function createSurtitleTimeline(words, masterLabels, classes = [], timing = {}) {
  if (words.length === 0) {
    return gsap.timeline();
  }

  const surtitleElement = words[0].closest(".rumor-surtitle");
  const customAnimFn = getCustomAnimationFunction("surtitle", classes);

  if (customAnimFn) {
    const child = customAnimFn(words, surtitleElement, masterLabels, classes, timing);
    const startTime = masterLabels.surtitleFadeInStart;
    const endTime = masterLabels.surtitleFadeOutEnd;
    const desiredDuration = endTime - startTime;
    const naturalDuration = child.duration();

    if (desiredDuration > 0 && naturalDuration > 0) {
      const timeScale = naturalDuration / desiredDuration;
      child.timeScale(timeScale);
    }

    return child;
  }

  // Default animation
  const child = gsap.timeline();
  const animConfig = DEFAULT_ANIMATIONS.surtitle;

  child.to(words, {
    opacity: 1,
    y: 0,
    duration: animConfig.fadeIn.duration,
    ease: animConfig.fadeIn.ease,
    stagger: animConfig.fadeIn.stagger,
  }, animConfig.fadeIn.delay);

  const fadeInEndTime = animConfig.fadeIn.delay + animConfig.fadeIn.duration + ((words.length - 1) * animConfig.fadeIn.stagger);

  child.to(words, {
    opacity: 0,
    y: animConfig.fadeOut.y,
    duration: animConfig.fadeOut.duration,
    ease: animConfig.fadeOut.ease,
    stagger: animConfig.fadeOut.stagger,
  }, fadeInEndTime);

  const startTime = masterLabels.surtitleFadeInStart;
  const endTime = masterLabels.surtitleFadeOutEnd;
  const desiredDuration = endTime - startTime;
  const naturalDuration = child.duration();

  if (desiredDuration > 0 && naturalDuration > 0) {
    const timeScale = naturalDuration / desiredDuration;
    child.timeScale(timeScale);
  }

  return child;
}

/**
 * Creates a timeline for animating title words
 * @param {NodeList} words - Word elements to animate
 * @param {Object} masterLabels - Object containing master timeline label times
 * @param {Array<string>} classes - CSS classes applied to the title element
 * @returns {GSAP.Timeline} - Child timeline for title animations
 */
function createTitleTimeline(words, masterLabels, classes = [], timing = {}) {
  // Get the title element (parent of words)
  const titleElement = words.length > 0 ? words[0].closest(".rumor-title") : null;

  // Check for custom animation function
  const customAnimFn = getCustomAnimationFunction("title", classes);

  if (customAnimFn) {
    // Use custom animation function
    const child = customAnimFn(words, titleElement, masterLabels, classes, timing);

    // Calculate timeScale to stretch timeline to fit between labels
    const startTime = masterLabels.titleFadeInStart;
    const endTime = masterLabels.titleFadeOutEnd;
    const desiredDuration = endTime - startTime;
    const naturalDuration = child.duration();

    if (desiredDuration > 0 && naturalDuration > 0) {
      const timeScale = naturalDuration / desiredDuration;
      child.timeScale(timeScale);
    }

    return child;
  }

  // Default animation: use config-based approach
  const child = gsap.timeline();
  const animConfig = DEFAULT_ANIMATIONS.title;

  // Set initial state
  gsap.set(words, {
    opacity: ANIMATION_CONFIG.initialState.opacity,
    y: ANIMATION_CONFIG.initialState.y,
  });

  // Fade in animation
  child.to(words, {
    opacity: 1,
    y: 0,
    duration: animConfig.fadeIn.duration,
    ease: animConfig.fadeIn.ease,
    stagger: animConfig.fadeIn.stagger,
  }, animConfig.fadeIn.delay);

  // Calculate when fade-in completes
  const fadeInEndTime = animConfig.fadeIn.delay + animConfig.fadeIn.duration + ((words.length - 1) * animConfig.fadeIn.stagger);

  // Fade out animation
  child.to(words, {
    opacity: 0,
    y: animConfig.fadeOut.y,
    duration: animConfig.fadeOut.duration,
    ease: animConfig.fadeOut.ease,
    stagger: animConfig.fadeOut.stagger,
  }, fadeInEndTime);

  // Calculate timeScale to stretch timeline to fit between labels
  const startTime = masterLabels.titleFadeInStart;
  const endTime = masterLabels.titleFadeOutEnd;
  const desiredDuration = endTime - startTime;
  const naturalDuration = child.duration();

  if (desiredDuration > 0 && naturalDuration > 0) {
    const timeScale = naturalDuration / desiredDuration;
    child.timeScale(timeScale);
  }

  return child;
}

/**
 * Creates a timeline for animating subtitle words
 * @param {NodeList} words - Word elements to animate
 * @param {Object} masterLabels - Object containing master timeline label times
 * @param {Array<string>} classes - CSS classes applied to the subtitle element
 * @returns {GSAP.Timeline} - Child timeline for subtitle animations
 */
function createSubtitleTimeline(words, masterLabels, classes = [], timing = {}) {
  if (words.length === 0) {
    return gsap.timeline();
  }

  const subtitleElement = words[0].closest(".rumor-subtitle");
  const customAnimFn = getCustomAnimationFunction("subtitle", classes);

  if (customAnimFn) {
    const child = customAnimFn(words, subtitleElement, masterLabels, classes, timing);
    const startTime = masterLabels.subtitleFadeInStart;
    const endTime = masterLabels.subtitleFadeOutEnd;
    const desiredDuration = endTime - startTime;
    const naturalDuration = child.duration();

    if (desiredDuration > 0 && naturalDuration > 0) {
      const timeScale = naturalDuration / desiredDuration;
      child.timeScale(timeScale);
    }

    return child;
  }

  // Default animation
  const child = gsap.timeline();
  const animConfig = DEFAULT_ANIMATIONS.subtitle;

  child.to(words, {
    opacity: 1,
    y: 0,
    duration: animConfig.fadeIn.duration,
    ease: animConfig.fadeIn.ease,
    stagger: animConfig.fadeIn.stagger,
  }, animConfig.fadeIn.delay);

  const fadeInEndTime = animConfig.fadeIn.delay + animConfig.fadeIn.duration + ((words.length - 1) * animConfig.fadeIn.stagger);

  child.to(words, {
    opacity: 0,
    y: animConfig.fadeOut.y,
    duration: animConfig.fadeOut.duration,
    ease: animConfig.fadeOut.ease,
    stagger: animConfig.fadeOut.stagger,
  }, fadeInEndTime);

  const startTime = masterLabels.subtitleFadeInStart;
  const endTime = masterLabels.subtitleFadeOutEnd;
  const desiredDuration = endTime - startTime;
  const naturalDuration = child.duration();

  if (desiredDuration > 0 && naturalDuration > 0) {
    const timeScale = naturalDuration / desiredDuration;
    child.timeScale(timeScale);
  }

  return child;
}

/**
 * Creates a timeline for animating content words
 * @param {NodeList} words - Word elements to animate
 * @param {Object} masterLabels - Object containing master timeline label times
 * @param {Array<string>} classes - CSS classes applied to the content element
 * @returns {GSAP.Timeline} - Child timeline for content animations
 */
function createContentTimeline(words, masterLabels, classes = [], timing = {}) {
  const contentElement = words.length > 0 ? words[0].closest(".rumor-content") : null;
  const customAnimFn = getCustomAnimationFunction("content", classes);

  if (customAnimFn) {
    const child = customAnimFn(words, contentElement, masterLabels, classes, timing);
    const startTime = masterLabels.contentFadeInStart;
    const endTime = masterLabels.contentFadeOutEnd;
    const desiredDuration = endTime - startTime;
    const naturalDuration = child.duration();

    if (desiredDuration > 0 && naturalDuration > 0) {
      const timeScale = naturalDuration / desiredDuration;
      child.timeScale(timeScale);
    }

    return child;
  }

  // Default animation
  const child = gsap.timeline();
  const animConfig = DEFAULT_ANIMATIONS.content;

  child.to(words, {
    opacity: 1,
    y: 0,
    duration: animConfig.fadeIn.duration,
    ease: animConfig.fadeIn.ease,
    stagger: animConfig.fadeIn.stagger,
  }, animConfig.fadeIn.delay);

  const fadeInEndTime = animConfig.fadeIn.delay + animConfig.fadeIn.duration + ((words.length - 1) * animConfig.fadeIn.stagger);

  child.to(words, {
    opacity: 0,
    y: animConfig.fadeOut.y,
    duration: animConfig.fadeOut.duration,
    ease: animConfig.fadeOut.ease,
    stagger: animConfig.fadeOut.stagger,
  }, fadeInEndTime);

  const startTime = masterLabels.contentFadeInStart;
  const endTime = masterLabels.contentFadeOutEnd;
  const desiredDuration = endTime - startTime;
  const naturalDuration = child.duration();

  if (desiredDuration > 0 && naturalDuration > 0) {
    const timeScale = naturalDuration / desiredDuration;
    child.timeScale(timeScale);
  }

  return child;
}

/**
 * Creates the master timeline with container animations and labels
 * @param {HTMLElement} container - The rumor container element
 * @param {number} totalTimelineDuration - Total duration of the timeline
 * @param {Object} timingInfo - Object containing timing information
 * @returns {Object} - Object containing the master timeline and label times
 */
function createMasterTimeline(container, totalTimelineDuration, timingInfo) {
  const { fadeInCompleteTime, holdDurationSeconds, fadeOutStartTime, contentWordsCount } = timingInfo;

  const master = gsap.timeline({
    onComplete: () => {
      // After fade out, get next rumor and repeat
      setTimeout(() => {
        const nextRumor = getNextRumor(rumorStack, rumorsData, debugMode);
        displayRumor(nextRumor);
      }, ANIMATION_CONFIG.transition.nextRumorDelayMs);
    },
  });

  const halfwayPoint = totalTimelineDuration / 2;
  const thirdWayPoint = totalTimelineDuration / 3;
  const twoThirdsWayPoint = totalTimelineDuration * 2 / 3;

  // Set initial container state
  master.set(container, {
    opacity: 1,
    filter: `blur(${ANIMATION_CONFIG.container.fadeIn.blur}px) brightness(${ANIMATION_CONFIG.container.fadeIn.brightness})`,
    scale: ANIMATION_CONFIG.container.fadeIn.scale,
  });

  // Container movement - starts immediately and lasts full duration
  master.to(container, {
    y: -300,
    x: 500,
    duration: totalTimelineDuration,
    ease: "none",
  }, 0);

  // Container waver - starts immediately
  master.fromTo(container, {
    yPercent: -10
  }, {
    yPercent: 10,
    repeat: 2,
    yoyo: true,
    duration: totalTimelineDuration / 4,
    ease: "sine.inOut"
  }, 0);

  // Clear the smoky effect gradually until a third of the way through
  master.to(container, {
    filter: "blur(0px) brightness(1)",
    scale: 1,
    duration: thirdWayPoint,
    ease: "power2.out",
  }, 0);

  // Calculate fade-out end times (using default config for label positioning)
  const fadeOutDuration = DEFAULT_ANIMATIONS.content.fadeOut.duration +
    (contentWordsCount * DEFAULT_ANIMATIONS.content.fadeOut.stagger);

  // Add labels for component synchronization
  // Note: These use DEFAULT_ANIMATIONS delays for positioning, but component timelines
  // will use their actual configs (which may be overridden by classes)
  master.addLabel("surtitleFadeInStart", DEFAULT_ANIMATIONS.surtitle.fadeIn.delay);
  master.addLabel("titleFadeInStart", DEFAULT_ANIMATIONS.title.fadeIn.delay);
  master.addLabel("subtitleFadeInStart", DEFAULT_ANIMATIONS.subtitle.fadeIn.delay);
  master.addLabel("contentFadeInStart", DEFAULT_ANIMATIONS.content.fadeIn.delay);
  master.addLabel("fadeInComplete", fadeInCompleteTime);
  master.addLabel("holdComplete", fadeInCompleteTime + holdDurationSeconds);
  master.addLabel("contentFadeOutStart", fadeOutStartTime);
  master.addLabel("subtitleFadeOutStart", fadeOutStartTime);
  master.addLabel("titleFadeOutStart", fadeOutStartTime);
  master.addLabel("surtitleFadeOutStart", fadeOutStartTime);
  master.addLabel("contentFadeOutEnd", fadeOutStartTime + fadeOutDuration);
  master.addLabel("subtitleFadeOutEnd", fadeOutStartTime + fadeOutDuration);
  master.addLabel("titleFadeOutEnd", fadeOutStartTime + fadeOutDuration);
  master.addLabel("surtitleFadeOutEnd", fadeOutStartTime + fadeOutDuration);

  // Container fade out - starts at halfway point
  master.to(container, {
    opacity: 0,
    filter: `blur(${ANIMATION_CONFIG.container.fadeOut.blur}px) brightness(${ANIMATION_CONFIG.container.fadeOut.brightness})`,
    scale: ANIMATION_CONFIG.container.fadeOut.scale,
    duration: twoThirdsWayPoint,
    ease: "power2.in",
    onComplete: () => {
      // Reset filters and clear all inline styles to prevent interference with next animation
      gsap.set(container, { filter: "blur(0px) brightness(1)", scale: 1, x: 0, y: 0 });
      container.removeAttribute("style");
    },
  }, halfwayPoint);

  // Return timeline and label times for component timelines
  return {
    timeline: master,
    labels: {
      surtitleFadeInStart: DEFAULT_ANIMATIONS.surtitle.fadeIn.delay,
      surtitleFadeOutEnd: fadeOutStartTime + fadeOutDuration,
      titleFadeInStart: DEFAULT_ANIMATIONS.title.fadeIn.delay,
      titleFadeOutEnd: fadeOutStartTime + fadeOutDuration,
      subtitleFadeInStart: DEFAULT_ANIMATIONS.subtitle.fadeIn.delay,
      subtitleFadeOutEnd: fadeOutStartTime + fadeOutDuration,
      contentFadeInStart: DEFAULT_ANIMATIONS.content.fadeIn.delay,
      contentFadeOutEnd: fadeOutStartTime + fadeOutDuration,
    }
  };
}

/**
 * Displays a rumor with GSAP animations
 * @param {Object} rumor - The rumor object with title, content, surtitle, subtitle, classes, images, etc.
 */
function displayRumor(rumor) {
  const container = document.getElementById("rumor-container");

  // Remove all position classes
  container.classList.remove(
    "position-1",
    "position-2",
    "position-3"
  );

  // Randomly select one of three positions
  const randomPosition = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
  container.classList.add(`position-${randomPosition}`);

  // Clear existing elements (surtitle, subtitle will be recreated if needed)
  const existingSurtitle = document.getElementById("rumor-surtitle");
  const existingSubtitle = document.getElementById("rumor-subtitle");
  if (existingSurtitle) existingSurtitle.remove();
  if (existingSubtitle) existingSubtitle.remove();

  // Get or create elements (title and content already exist in HTML)
  const titleElement = getOrCreateElement("h1", "rumor-title", "rumor-title", rumor.titleClass || "");
  const contentElement = getOrCreateElement("div", "rumor-content", "rumor-content", rumor.contentClass || "");

  // Ensure title and content are in the container (they should already be)
  if (!container.contains(titleElement)) {
    container.appendChild(titleElement);
  }
  if (!container.contains(contentElement)) {
    container.appendChild(contentElement);
  }

  let surtitleElement = null;
  let subtitleElement = null;

  // Create surtitle if it exists
  if (rumor.surtitle) {
    surtitleElement = getOrCreateElement("span", "rumor-surtitle", "rumor-surtitle", rumor.surtitleClass || "");
    surtitleElement.innerHTML = splitIntoWords(rumor.surtitle);
    // Insert before title
    container.insertBefore(surtitleElement, titleElement);
  }

  // Set title content
  titleElement.innerHTML = splitIntoWords(rumor.title || rumor.key);

  // Create subtitle if it exists
  if (rumor.subtitle) {
    subtitleElement = getOrCreateElement("span", "rumor-subtitle", "rumor-subtitle", rumor.subtitleClass || "");
    subtitleElement.innerHTML = splitIntoWords(rumor.subtitle);
    // Insert after title
    titleElement.insertAdjacentElement("afterend", subtitleElement);
  }

  // Set content
  contentElement.innerHTML = formatRumorContent(rumor.content);

  // Create and insert images if they exist
  const imageElements = [];
  if (rumor.images && Array.isArray(rumor.images)) {
    rumor.images.forEach((imgData) => {
      const img = document.createElement("img");
      // Prepend base path - if src already starts with /, check if it includes /toronto-rising
      const basePath = "/toronto-rising/assets/images/rumor/";
      if (imgData.src.startsWith("/toronto-rising/")) {
        // Already has the prefix
        img.src = imgData.src;
      } else if (imgData.src.startsWith("/")) {
        // Absolute path without prefix - add it
        img.src = `/toronto-rising${imgData.src}`;
      } else {
        // Relative filename - prepend base path
        img.src = `${basePath}${imgData.src}`;
      }
      img.className = `content-image ${imgData.class || ""}`.trim();
      img.alt = ""; // Decorative images should have empty alt
      contentElement.appendChild(img);
      imageElements.push(img);
    });
  }

  // Get all word elements for animation
  const surtitleWords = surtitleElement ? surtitleElement.querySelectorAll(".word") : [];
  const titleWords = titleElement.querySelectorAll(".word");
  const subtitleWords = subtitleElement ? subtitleElement.querySelectorAll(".word") : [];
  const contentWords = contentElement.querySelectorAll(".word");

  gsap.globalTimeline.timeScale(ANIMATION_CONFIG.globalTimeScale);

  // Set words to initial state for animation
  const allWords = [...surtitleWords, ...titleWords, ...subtitleWords, ...contentWords];
  gsap.set(allWords, {
    opacity: ANIMATION_CONFIG.initialState.opacity,
    y: ANIMATION_CONFIG.initialState.y,
  });

  // Calculate display duration
  let holdDurationSeconds;
  if (ANIMATION_CONFIG.displayDuration.useDynamicCalculation) {
    // Dynamic calculation based on content length
    const contentLength = Array.isArray(rumor.content) ? rumor.content.length : (rumor.content || "").split(" ").length;
    const displayDurationMs = Math.max(
      ANIMATION_CONFIG.displayDuration.baseTimeMs,
      contentLength * ANIMATION_CONFIG.displayDuration.multiplierMs
    );
    holdDurationSeconds = displayDurationMs / 1000;
  } else {
    // Use fixed hold duration
    holdDurationSeconds = ANIMATION_CONFIG.displayDuration.holdDurationMs / 1000;
  }

  // Extract classes from elements for animation customization
  const surtitleClasses = surtitleElement ? surtitleElement.className.split(" ").filter(c => c.trim()) : [];
  const titleClasses = titleElement.className.split(" ").filter(c => c.trim());
  const subtitleClasses = subtitleElement ? subtitleElement.className.split(" ").filter(c => c.trim()) : [];
  const contentClasses = contentElement.className.split(" ").filter(c => c.trim());

  // Calculate estimated fade-in end times for initial timeline setup
  // These will be refined after the timeline is built
  const estimatedSurtitleFadeInEnd = surtitleWords.length > 0
    ? DEFAULT_ANIMATIONS.surtitle.fadeIn.delay +
      DEFAULT_ANIMATIONS.surtitle.fadeIn.duration +
      ((surtitleWords.length - 1) * DEFAULT_ANIMATIONS.surtitle.fadeIn.stagger)
    : 0;
  const estimatedTitleFadeInEnd = DEFAULT_ANIMATIONS.title.fadeIn.delay +
    DEFAULT_ANIMATIONS.title.fadeIn.duration +
    ((titleWords.length - 1) * DEFAULT_ANIMATIONS.title.fadeIn.stagger);
  const estimatedSubtitleFadeInEnd = subtitleWords.length > 0
    ? DEFAULT_ANIMATIONS.subtitle.fadeIn.delay +
      DEFAULT_ANIMATIONS.subtitle.fadeIn.duration +
      ((subtitleWords.length - 1) * DEFAULT_ANIMATIONS.subtitle.fadeIn.stagger)
    : 0;
  const estimatedContentFadeInEnd = DEFAULT_ANIMATIONS.content.fadeIn.delay +
    DEFAULT_ANIMATIONS.content.fadeIn.duration +
    ((contentWords.length - 1) * DEFAULT_ANIMATIONS.content.fadeIn.stagger);
  const estimatedFadeInCompleteTime = Math.max(estimatedSurtitleFadeInEnd, estimatedTitleFadeInEnd, estimatedSubtitleFadeInEnd, estimatedContentFadeInEnd);

  // Calculate estimated fade-out duration
  const estimatedFadeOutDuration = DEFAULT_ANIMATIONS.content.fadeOut.duration +
    ((contentWords.length - 1) * DEFAULT_ANIMATIONS.content.fadeOut.stagger);

  // Calculate timeline timing (estimated, will be refined after timeline is built)
  const estimatedFadeOutStartTime = estimatedFadeInCompleteTime + holdDurationSeconds;
  const totalTimelineDuration = estimatedFadeOutStartTime + estimatedFadeOutDuration;

  // Create master timeline with container animations (using estimated values)
  const { timeline: masterTimeline, labels: estimatedLabels } = createMasterTimeline(container, totalTimelineDuration, {
    fadeInCompleteTime: estimatedFadeInCompleteTime,
    holdDurationSeconds,
    fadeOutStartTime: estimatedFadeOutStartTime,
    contentWordsCount: contentWords.length,
  });

  // Create placeholder timing object (will be replaced with accurate values after timeline is built)
  // This is needed for child timeline creation, but will be recalculated
  const placeholderTiming = {
    fadeInStart: 0,
    fadeInDuration: 10,
    fadeInComplete: 10,
    holdStart: 10,
    holdDuration: 80,
    holdComplete: 90,
    fadeOutStart: 90,
    fadeOutDuration: 10,
    fadeOutEnd: 100,
    totalDuration: 100,
  };

  // Store reference to current timeline for pause/resume
  currentTimeline = masterTimeline;

  // Create component timelines and add them to master timeline (using placeholder timing)
  if (surtitleWords.length > 0) {
    const surtitleTimeline = createSurtitleTimeline(surtitleWords, estimatedLabels, surtitleClasses, placeholderTiming);
    masterTimeline.add(surtitleTimeline, "surtitleFadeInStart");
  }

  const titleTimeline = createTitleTimeline(titleWords, estimatedLabels, titleClasses, placeholderTiming);
  masterTimeline.add(titleTimeline, "titleFadeInStart");

  if (subtitleWords.length > 0) {
    const subtitleTimeline = createSubtitleTimeline(subtitleWords, estimatedLabels, subtitleClasses, placeholderTiming);
    masterTimeline.add(subtitleTimeline, "subtitleFadeInStart");
  }

  const contentTimeline = createContentTimeline(contentWords, estimatedLabels, contentClasses, placeholderTiming);
  masterTimeline.add(contentTimeline, "contentFadeInStart");

  // Now that all timelines are added, add labels at key points to mark actual timing
  // Calculate where content fade-in actually ends based on the child timeline
  const contentTimelineStartTime = estimatedLabels.contentFadeInStart;
  const contentTimelineNaturalDuration = contentTimeline.duration();
  const contentTimelineDesiredDuration = estimatedLabels.contentFadeOutEnd - contentTimelineStartTime;
  const contentTimeScale = contentTimelineNaturalDuration / contentTimelineDesiredDuration;

  // Calculate natural fade-in end within the content timeline
  const contentFadeInNaturalEnd = DEFAULT_ANIMATIONS.content.fadeIn.delay +
    DEFAULT_ANIMATIONS.content.fadeIn.duration +
    ((contentWords.length - 1) * DEFAULT_ANIMATIONS.content.fadeIn.stagger);

  // Calculate actual fade-in end in master timeline (accounting for timeScale)
  const actualContentFadeInEnd = contentTimelineStartTime + (contentFadeInNaturalEnd / contentTimeScale);

  // Add label at actual content fade-in end
  masterTimeline.addLabel("contentFadeInComplete", actualContentFadeInEnd);

  // Get the actual total duration of the content timeline (fade-in + fade-out)
  // This is the duration from contentFadeInStart to contentFadeOutEnd
  const contentTimelineActualDuration = contentTimelineDesiredDuration; // This is the stretched duration

  // Calculate fade-in duration (from start to complete)
  const fadeInDurationAbsolute = actualContentFadeInEnd - contentTimelineStartTime;

  // Since fade-out uses the same stagger pattern and timeScale as fade-in,
  // fade-out duration equals fade-in duration
  const fadeOutDurationAbsolute = fadeInDurationAbsolute;

  // Calculate fade-out end (total duration from contentFadeInStart)
  const actualContentFadeOutEnd = contentTimelineStartTime + contentTimelineActualDuration;

  // Calculate fade-out start (fade-out end minus fade-out duration)
  const actualContentFadeOutStart = actualContentFadeOutEnd - fadeOutDurationAbsolute;

  // Add labels at actual fade-out positions
  masterTimeline.addLabel("contentFadeOutStart", actualContentFadeOutStart);
  masterTimeline.addLabel("contentFadeOutEnd", actualContentFadeOutEnd);

  // Read actual label positions from the master timeline
  const actualLabels = {
    contentFadeInStart: masterTimeline.labels.contentFadeInStart,
    contentFadeInComplete: masterTimeline.labels.contentFadeInComplete,
    contentFadeOutStart: masterTimeline.labels.contentFadeOutStart,
    contentFadeOutEnd: masterTimeline.labels.contentFadeOutEnd,
  };

  // Calculate actual durations
  const totalDuration = actualLabels.contentFadeOutEnd - actualLabels.contentFadeInStart;
  const holdDurationAbsolute = actualLabels.contentFadeOutStart - actualLabels.contentFadeInComplete;

  // Create accurate timing object based on actual label positions
  // fadeOutDurationAbsolute equals fadeInDurationAbsolute since they use the same stagger/timeScale
  const timing = {
    fadeInStart: 0, // Always 0% (start of 100s timeline)
    fadeInDuration: (fadeInDurationAbsolute / totalDuration) * 100,
    fadeInComplete: ((actualLabels.contentFadeInComplete - actualLabels.contentFadeInStart) / totalDuration) * 100,
    holdStart: ((actualLabels.contentFadeInComplete - actualLabels.contentFadeInStart) / totalDuration) * 100,
    holdDuration: (holdDurationAbsolute / totalDuration) * 100,
    holdComplete: ((actualLabels.contentFadeOutStart - actualLabels.contentFadeInStart) / totalDuration) * 100,
    fadeOutStart: ((actualLabels.contentFadeOutStart - actualLabels.contentFadeInStart) / totalDuration) * 100,
    fadeOutDuration: (fadeInDurationAbsolute / totalDuration) * 100, // Same as fadeInDuration
    fadeOutEnd: 100, // Always 100% (end of 100s timeline)
    totalDuration: 100, // Always 100 for consistency with prepareFixedTimeline(100)
  };

  // Debug logging
  console.log('=== Animation Timing Debug ===');
  console.log('Content fade-in start (actual):', actualLabels.contentFadeInStart, 's');
  console.log('Content fade-in complete (actual):', actualLabels.contentFadeInComplete, 's');
  console.log('Content fade-out start (actual):', actualLabels.contentFadeOutStart, 's');
  console.log('Content fade-out end (actual):', actualLabels.contentFadeOutEnd, 's');
  console.log('Fade-in duration (absolute):', fadeInDurationAbsolute, 's');
  console.log('Hold duration (absolute):', holdDurationAbsolute, 's');
  console.log('Fade-out duration (absolute):', fadeOutDurationAbsolute, 's');
  console.log('Total timeline duration:', totalDuration, 's');
  console.log('Content words count:', contentWords.length);
  console.log('Content timeline natural duration:', contentTimelineNaturalDuration, 's');
  console.log('Content timeline timeScale:', contentTimeScale);
  console.log('Timing object (percentages):', timing);
  console.log('=============================');

  // Expose master timeline to console for debugging
  window.currentMasterTimeline = masterTimeline;
  console.log('Master timeline exposed as window.currentMasterTimeline');
  console.log('Use masterTimeline.pause() and masterTimeline.time() to debug');

  // Animate images fade-in (using actual labels and timing)
  if (imageElements.length > 0) {
    animateImagesFadeIn(imageElements, masterTimeline, actualLabels, timing);
  }

  // Fade out images (only for default animations - custom functions handle their own fade-out)
  if (imageElements.length > 0) {
    animateImagesFadeOut(imageElements, masterTimeline, actualLabels, timing);
  }
}

// Initialize shuffled stack
let rumorStack = createShuffledStack(rumorsData);

// Track current timeline for pause/resume functionality
let currentTimeline = null;

// Track debug mode state
// Enabled by default in development, disabled in production builds
let debugMode = import.meta.env.DEV;

// Start displaying rumors
const firstRumor = getNextRumor(rumorStack, rumorsData, debugMode);
displayRumor(firstRumor);

// Debug buttons - only available in development mode
// In production builds, these buttons are automatically removed
if (import.meta.env.DEV) {
  // Pause/Resume button functionality
  const pauseButton = document.getElementById("pause-btn");
  let isPaused = false;

  if (pauseButton) {
    pauseButton.addEventListener("click", () => {
      if (isPaused) {
        // Resume animation
        if (currentTimeline) {
          currentTimeline.resume();
        }
        pauseButton.textContent = "⏸";
        pauseButton.classList.remove("paused");
        isPaused = false;
      } else {
        // Pause animation
        if (currentTimeline) {
          currentTimeline.pause();
        }
        pauseButton.textContent = "▶";
        pauseButton.classList.add("paused");
        isPaused = true;
      }
    });
  }

  // Debug button functionality
  const debugButton = document.getElementById("debug-btn");

  if (debugButton) {
    // Initialize button state to match default debug mode (enabled)
    debugButton.classList.add("active");
    debugButton.title = "Debug mode ON - showing first rumor";

    debugButton.addEventListener("click", () => {
      debugMode = !debugMode;

      if (debugMode) {
        debugButton.classList.add("active");
        debugButton.textContent = "🔍";
        debugButton.title = "Debug mode ON - showing first rumor";
      } else {
        debugButton.classList.remove("active");
        debugButton.textContent = "🔍";
        debugButton.title = "Debug mode OFF - random selection";
      }
    });
  }
} else {
  // Production mode: remove debug buttons from DOM and disable debug mode
  const pauseButton = document.getElementById("pause-btn");
  const debugButton = document.getElementById("debug-btn");

  if (pauseButton) {
    pauseButton.remove();
  }
  if (debugButton) {
    debugButton.remove();
  }

  // Disable debug mode in production
  debugMode = false;
}
