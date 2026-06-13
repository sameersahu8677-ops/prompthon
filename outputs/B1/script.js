/* =========================================================
   1. DOM SELECTORS
========================================================= */

const markdownEditor = document.getElementById("markdown-editor");
const previewContent = document.getElementById("preview-content");

const wordCount = document.getElementById("word-count");
const characterCount = document.getElementById("character-count");
const saveStatus = document.getElementById("save-status");

const copyButton = document.getElementById("copy-btn");
const resetButton = document.getElementById("reset-btn");
const exportButton = document.getElementById("export-btn");

const toastContainer = document.getElementById("toast-container");


/* =========================================================
   2. APPLICATION CONSTANTS
========================================================= */

const STORAGE_KEY = "markdown-editor-content";

const STATUS = {
    READY: "✓ Ready",
    SAVED: "✓ Auto Saved"
};


/* =========================================================
   3. STORAGE MODULE
========================================================= */

/**
 * Save markdown content to localStorage.
 * Never throws application-breaking errors.
 *
 * @param {string} content
 */
function saveContent(content) {
    try {
        localStorage.setItem(STORAGE_KEY, content);
        return true;
    } catch (error) {
        console.error(
            "[Storage] Failed to save content:",
            error
        );

        return false;
    }
}


/**
 * Load markdown content from localStorage.
 * Returns empty string if unavailable.
 *
 * @returns {string}
 */
function loadContent() {
    try {
        const savedContent = localStorage.getItem(STORAGE_KEY);

        if (savedContent === null) {
            return "";
        }

        return savedContent;
    } catch (error) {
        console.error(
            "[Storage] Failed to load content:",
            error
        );

        return "";
    }
}


/**
 * Remove stored markdown content.
 * Never throws application-breaking errors.
 *
 * @returns {boolean}
 */
function clearContent() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error(
            "[Storage] Failed to clear content:",
            error
        );

        return false;
    }
}

/* =========================================================
   4. SANITIZER MODULE
========================================================= */

/**
 * Escapes potentially dangerous HTML characters.
 * Prevents XSS by converting raw HTML into harmless text.
 *
 * Example:
 * <script>alert(1)</script>
 *
 * becomes:
 *
 * &lt;script&gt;alert(1)&lt;/script&gt;
 *
 * @param {string} text
 * @returns {string}
 */
function sanitizeInput(text) {
    if (typeof text !== "string") {
        return "";
    }

    const escapeMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return text.replace(
        /[&<>"']/g,
        (character) => escapeMap[character]
    );
}