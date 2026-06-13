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

/* =========================================================
   5. MARKDOWN PARSER MODULE
========================================================= */

/**
 * Converts sanitized markdown into safe HTML.
 *
 * Supported:
 * - H1, H2, H3
 * - Bold
 * - Italic
 * - Inline Code
 * - Ordered Lists
 * - Unordered Lists
 * - Paragraphs
 *
 * @param {string} markdown
 * @returns {string}
 */
function parseMarkdown(markdown) {
    if (!markdown || typeof markdown !== "string") {
        return "";
    }

    const lines = markdown.split("\n");

    let html = [];

    let inOrderedList = false;
    let inUnorderedList = false;

    /**
     * Close any active lists before
     * switching to another block type.
     */
    function closeLists() {
        if (inOrderedList) {
            html.push("</ol>");
            inOrderedList = false;
        }

        if (inUnorderedList) {
            html.push("</ul>");
            inUnorderedList = false;
        }
    }

    /**
     * Inline markdown parsing.
     * Order matters.
     */
    function parseInline(text) {
        let result = text;

        /* Inline Code */
        result = result.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

        /* Bold */
        result = result.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );

        /* Italic */
        result = result.replace(
            /\*(.+?)\*/g,
            "<em>$1</em>"
        );

        return result;
    }

    for (const rawLine of lines) {
        const line = rawLine.trim();

        /* Empty Line */
        if (line === "") {
            closeLists();
            continue;
        }

        /* H1 */
        if (/^#\s+/.test(line)) {
            closeLists();

            html.push(
                `<h1>${parseInline(
                    line.replace(/^#\s+/, "")
                )}</h1>`
            );

            continue;
        }

        /* H2 */
        if (/^##\s+/.test(line)) {
            closeLists();

            html.push(
                `<h2>${parseInline(
                    line.replace(/^##\s+/, "")
                )}</h2>`
            );

            continue;
        }

        /* H3 */
        if (/^###\s+/.test(line)) {
            closeLists();

            html.push(
                `<h3>${parseInline(
                    line.replace(/^###\s+/, "")
                )}</h3>`
            );

            continue;
        }

        /* Ordered List */
        if (/^\d+\.\s+/.test(line)) {
            if (inUnorderedList) {
                html.push("</ul>");
                inUnorderedList = false;
            }

            if (!inOrderedList) {
                html.push("<ol>");
                inOrderedList = true;
            }

            html.push(
                `<li>${parseInline(
                    line.replace(/^\d+\.\s+/, "")
                )}</li>`
            );

            continue;
        }

        /* Unordered List */
        if (/^-\s+/.test(line)) {
            if (inOrderedList) {
                html.push("</ol>");
                inOrderedList = false;
            }

            if (!inUnorderedList) {
                html.push("<ul>");
                inUnorderedList = true;
            }

            html.push(
                `<li>${parseInline(
                    line.replace(/^-\s+/, "")
                )}</li>`
            );

            continue;
        }

        /* Paragraph */
        closeLists();

        html.push(
            `<p>${parseInline(line)}</p>`
        );
    }

    closeLists();

    return html.join("\n");
}/* =========================================================
   5. MARKDOWN PARSER MODULE
========================================================= */

/**
 * Converts sanitized markdown into safe HTML.
 *
 * Supported:
 * - H1, H2, H3
 * - Bold
 * - Italic
 * - Inline Code
 * - Ordered Lists
 * - Unordered Lists
 * - Paragraphs
 *
 * @param {string} markdown
 * @returns {string}
 */
function parseMarkdown(markdown) {
    if (!markdown || typeof markdown !== "string") {
        return "";
    }

    const lines = markdown.split("\n");

    let html = [];

    let inOrderedList = false;
    let inUnorderedList = false;

    /**
     * Close any active lists before
     * switching to another block type.
     */
    function closeLists() {
        if (inOrderedList) {
            html.push("</ol>");
            inOrderedList = false;
        }

        if (inUnorderedList) {
            html.push("</ul>");
            inUnorderedList = false;
        }
    }

    /**
     * Inline markdown parsing.
     * Order matters.
     */
    function parseInline(text) {
        let result = text;

        /* Inline Code */
        result = result.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

        /* Bold */
        result = result.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );

        /* Italic */
        result = result.replace(
            /\*(.+?)\*/g,
            "<em>$1</em>"
        );

        return result;
    }

    for (const rawLine of lines) {
        const line = rawLine.trim();

        /* Empty Line */
        if (line === "") {
            closeLists();
            continue;
        }

        /* H1 */
        if (/^#\s+/.test(line)) {
            closeLists();

            html.push(
                `<h1>${parseInline(
                    line.replace(/^#\s+/, "")
                )}</h1>`
            );

            continue;
        }

        /* H2 */
        if (/^##\s+/.test(line)) {
            closeLists();

            html.push(
                `<h2>${parseInline(
                    line.replace(/^##\s+/, "")
                )}</h2>`
            );

            continue;
        }

        /* H3 */
        if (/^###\s+/.test(line)) {
            closeLists();

            html.push(
                `<h3>${parseInline(
                    line.replace(/^###\s+/, "")
                )}</h3>`
            );

            continue;
        }

        /* Ordered List */
        if (/^\d+\.\s+/.test(line)) {
            if (inUnorderedList) {
                html.push("</ul>");
                inUnorderedList = false;
            }

            if (!inOrderedList) {
                html.push("<ol>");
                inOrderedList = true;
            }

            html.push(
                `<li>${parseInline(
                    line.replace(/^\d+\.\s+/, "")
                )}</li>`
            );

            continue;
        }

        /* Unordered List */
        if (/^-\s+/.test(line)) {
            if (inOrderedList) {
                html.push("</ol>");
                inOrderedList = false;
            }

            if (!inUnorderedList) {
                html.push("<ul>");
                inUnorderedList = true;
            }

            html.push(
                `<li>${parseInline(
                    line.replace(/^-\s+/, "")
                )}</li>`
            );

            continue;
        }

        /* Paragraph */
        closeLists();

        html.push(
            `<p>${parseInline(line)}</p>`
        );
    }

    closeLists();

    return html.join("\n");
}