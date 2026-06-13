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

/* =========================================================
   6. PREVIEW RENDERER MODULE
========================================================= */

/**
 * Renders markdown content into the live preview.
 *
 * Flow:
 * Raw Editor Content
 *      ↓
 * sanitizeInput()
 *      ↓
 * parseMarkdown()
 *      ↓
 * Preview Output
 */
function renderPreview() {
    try {
        const content = markdownEditor.value;

        if (!content || content.trim() === "") {
            previewContent.innerHTML = "";
            return;
        }

        const sanitizedContent = sanitizeInput(content);
        const renderedHTML = parseMarkdown(sanitizedContent);

        previewContent.innerHTML = renderedHTML;
    } catch (error) {
        console.error(
            "[Preview] Failed to render preview:",
            error
        );

        previewContent.innerHTML = `
            <p>Preview could not be generated.</p>
        `;
    }
}


/* =========================================================
   7. STATISTICS MODULE
========================================================= */

/**
 * Counts actual words while ignoring
 * excess whitespace.
 *
 * @param {string} content
 * @returns {number}
 */
function calculateWordCount(content) {
    if (!content || content.trim() === "") {
        return 0;
    }

    return content
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}


/**
 * Updates word and character statistics.
 *
 * @param {string} content
 */
function updateStatistics(content) {
    const safeContent = content || "";

    const words = calculateWordCount(safeContent);
    const characters = safeContent.length;

    wordCount.textContent = `Words: ${words}`;
    characterCount.textContent = `Characters: ${characters}`;
}

/* =========================================================
   8. TOAST SYSTEM
========================================================= */

/**
 * Displays a temporary toast notification.
 *
 * @param {string} message
 * @param {"success"|"error"|"warning"|"info"} type
 */
function showToast(message, type = "info") {
    try {
        const toast = document.createElement("div");

        toast.classList.add("toast", type);
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hide");

            setTimeout(() => {
                toast.remove();
            }, 250);
        }, 3000);
    } catch (error) {
        console.error(
            "[Toast] Failed to display toast:",
            error
        );
    }
}


/* =========================================================
   9. CLIPBOARD SYSTEM
========================================================= */

/**
 * Copies rendered HTML from preview.
 */
async function copyRenderedHTML() {
    try {
        const html = previewContent.innerHTML;

        if (!html.trim()) {
            showToast(
                "Nothing to copy.",
                "warning"
            );
            return;
        }

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(html);

            showToast(
                "HTML copied successfully.",
                "success"
            );

            return;
        }

        const temporaryTextArea =
            document.createElement("textarea");

        temporaryTextArea.value = html;

        temporaryTextArea.style.position = "fixed";
        temporaryTextArea.style.left = "-9999px";

        document.body.appendChild(
            temporaryTextArea
        );

        temporaryTextArea.focus();
        temporaryTextArea.select();

        const successful =
            document.execCommand("copy");

        document.body.removeChild(
            temporaryTextArea
        );

        if (successful) {
            showToast(
                "HTML copied successfully.",
                "success"
            );
        } else {
            throw new Error(
                "Clipboard fallback failed."
            );
        }
    } catch (error) {
        console.error(
            "[Clipboard] Copy failed:",
            error
        );

        showToast(
            "Unable to copy HTML.",
            "error"
        );
    }
}


/* =========================================================
   10. EXPORT SYSTEM
========================================================= */

/**
 * Downloads rendered content
 * as a complete HTML file.
 */
function exportHTML() {
    try {
        const renderedContent =
            previewContent.innerHTML;

        if (!renderedContent.trim()) {
            showToast(
                "Nothing to export.",
                "warning"
            );
            return;
        }

        const exportDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>

<style>
body{
    max-width:900px;
    margin:40px auto;
    padding:20px;
    font-family:Arial,sans-serif;
    line-height:1.7;
    color:#222;
}

h1,h2,h3{
    margin-top:1.5rem;
}

code{
    background:#f4f4f4;
    padding:2px 6px;
    border-radius:4px;
    font-family:Consolas,monospace;
}
</style>
</head>
<body>

${renderedContent}

</body>
</html>
`;

        const blob = new Blob(
            [exportDocument],
            {
                type: "text/html"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "markdown-export.html";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showToast(
            "HTML exported successfully.",
            "success"
        );
    } catch (error) {
        console.error(
            "[Export] Export failed:",
            error
        );

        showToast(
            "Export failed.",
            "error"
        );
    }
}


/* =========================================================
   11. RESET SYSTEM
========================================================= */

/**
 * Clears editor, preview,
 * statistics and storage.
 */
function resetDocument() {
    try {
        markdownEditor.value = "";

        clearContent();

        renderPreview();
        updateStatistics("");

        saveStatus.textContent =
            STATUS.READY;

        showToast(
            "Document cleared.",
            "success"
        );
    } catch (error) {
        console.error(
            "[Reset] Failed to reset document:",
            error
        );

        showToast(
            "Unable to clear document.",
            "error"
        );
    }
}

/* =========================================================
   12. APPLICATION CONTROLLER
========================================================= */

/**
 * Updates save status text.
 *
 * @param {string} status
 */
function updateSaveStatus(status) {
    saveStatus.textContent = status;
}


/**
 * Handles all editor updates.
 *
 * Flow:
 * Save Content
 * ↓
 * Render Preview
 * ↓
 * Update Statistics
 * ↓
 * Update Save Status
 */
function handleEditorUpdate() {
    const content = markdownEditor.value;

    saveContent(content);

    renderPreview();

    updateStatistics(content);

    updateSaveStatus(
        STATUS.SAVED
    );
}


/* =========================================================
   13. EVENT REGISTRATION
========================================================= */

/**
 * Registers all application events.
 */
function registerEventListeners() {

    /* Live Preview */
    markdownEditor.addEventListener(
        "input",
        handleEditorUpdate
    );

    /* Copy HTML */
    copyButton.addEventListener(
        "click",
        copyRenderedHTML
    );

    /* Export HTML */
    exportButton.addEventListener(
        "click",
        exportHTML
    );

    /* Reset Document */
    resetButton.addEventListener(
        "click",
        resetDocument
    );
}


/* =========================================================
   14. APPLICATION INITIALIZATION
========================================================= */

/**
 * Initializes application.
 */
function initializeApp() {
    try {

        const storedContent =
            loadContent();

        if (
            storedContent &&
            storedContent.trim() !== ""
        ) {
            markdownEditor.value =
                storedContent;
        }

        renderPreview();

        updateStatistics(
            markdownEditor.value
        );

        updateSaveStatus(
            STATUS.READY
        );

        registerEventListeners();

    } catch (error) {

        console.error(
            "[App] Initialization failed:",
            error
        );

        showToast(
            "Application failed to initialize.",
            "error"
        );
    }
}


/* =========================================================
   15. APPLICATION STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);