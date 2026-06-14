/* ===================================== */
/* CONSTANTS */
/* ===================================== */

const STORAGE_KEY = "libraryData";
const MAX_LOGS = 500;

/* ===================================== */
/* STATE */
/* ===================================== */

const state = {
    books: [],
    activeLoans: [],
    loanHistory: [],
    logs: []
};

/* ===================================== */
/* DOM REFERENCES */
/* ===================================== */

const elements = {
    inventoryTableBody:
        document.getElementById("inventory-table-body"),

    inventorySearch:
        document.getElementById("inventory-search"),

    inventoryEmptyState:
        document.getElementById("inventory-empty-state"),

    addBookBtn:
        document.getElementById("add-book-btn"),

    navButtons:
        document.querySelectorAll(".nav-btn"),

    sections:
        document.querySelectorAll(".content-section"),

    currentPageTitle:
        document.getElementById("current-page-title"),

    toastContainer:
        document.getElementById("toast-container")
};

/* ===================================== */
/* STORAGE */
/* ===================================== */

function loadData() {

    try {

        const rawData =
            localStorage.getItem(STORAGE_KEY);

        if (!rawData) {
            return;
        }

        const parsed =
            JSON.parse(rawData);

        state.books =
            parsed.books || [];

        state.activeLoans =
            parsed.activeLoans || [];

        state.loanHistory =
            parsed.loanHistory || [];

        state.logs =
            parsed.logs || [];

    } catch (error) {

        console.error(
            "Failed to load data:",
            error
        );

    }

}

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}

/* ===================================== */
/* UTILITIES */
/* ===================================== */

function generateId(prefix = "ID") {

    return `${prefix}-${Date.now()}-${Math.floor(
        Math.random() * 1000
    )}`;

}

function formatDate(dateValue) {

    if (!dateValue) {
        return "--";
    }

    return new Date(dateValue)
        .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

}

function showToast(
    message,
    type = "info"
) {

    if (!elements.toastContainer) {
        alert(message);
        return;
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;

    toast.textContent =
        message;

    elements.toastContainer
        .appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

function addLog(
    action,
    description
) {

    state.logs.unshift({
        action,
        description,
        timestamp:
            new Date().toISOString()
    });

    if (
        state.logs.length >
        MAX_LOGS
    ) {

        state.logs =
            state.logs.slice(
                0,
                MAX_LOGS
            );

    }

    saveData();

}

/* ===================================== */
/* VALIDATION */
/* ===================================== */

function validateBook(bookData) {

    const title =
        bookData.title?.trim();

    const author =
        bookData.author?.trim();

    const totalCopies =
        Number(
            bookData.totalCopies
        );

    if (!title) {

        throw new Error(
            "Book title is required."
        );

    }

    if (!author) {

        throw new Error(
            "Author name is required."
        );

    }

    if (
        Number.isNaN(totalCopies) ||
        totalCopies < 1
    ) {

        throw new Error(
            "Copies must be at least 1."
        );

    }

    return true;

}

/* ===================================== */
/* STATUS */
/* ===================================== */

function getBookStatus(book) {

    const availableCopies =
        book.totalCopies -
        book.borrowedCopies;

    if (
        availableCopies <= 0
    ) {

        return {
            label: "Out Of Stock",
            className:
                "status-out-of-stock"
        };

    }

    if (
        availableCopies <= 2
    ) {

        return {
            label: "Low Stock",
            className:
                "status-low-stock"
        };

    }

    return {
        label: "Available",
        className:
            "status-available"
    };

}

/* ===================================== */
/* INVENTORY */
/* ===================================== */

function renderInventory(
    searchTerm = ""
) {

    if (
        !elements.inventoryTableBody
    ) {
        return;
    }

    const query =
        searchTerm
            .trim()
            .toLowerCase();

    const books =
        state.books.filter(
            book => {

                return (
                    String(book.id)
                        .toLowerCase()
                        .includes(query)

                    ||

                    book.title
                        .toLowerCase()
                        .includes(query)

                    ||

                    book.author
                        .toLowerCase()
                        .includes(query)
                );

            }
        );

    elements.inventoryTableBody
        .innerHTML = "";

    if (!books.length) {

        elements
            .inventoryEmptyState
            ?.classList
            .remove("hidden");

        return;

    }

    elements
        .inventoryEmptyState
        ?.classList
        .add("hidden");

    books.forEach(book => {

        const availableCopies =
            book.totalCopies -
            book.borrowedCopies;

        const status =
            getBookStatus(book);

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.totalCopies}</td>
            <td>${book.borrowedCopies}</td>
            <td>${availableCopies}</td>
            <td>
                <span class="${status.className}">
                    ${status.label}
                </span>
            </td>
            <td>
                <button
                    class="btn-secondary edit-book-btn"
                    data-id="${book.id}">
                    Edit
                </button>

                <button
                    class="btn-danger delete-book-btn"
                    data-id="${book.id}">
                    Delete
                </button>
            </td>
        `;

        elements
            .inventoryTableBody
            .appendChild(row);

    });

}

/* ===================================== */
/* BOOK CRUD */
/* ===================================== */

function addBook() {

    try {

        const title =
            prompt(
                "Book Title:"
            );

        if (!title) {
            return;
        }

        const author =
            prompt(
                "Author:"
            );

        if (!author) {
            return;
        }

        const totalCopies =
            prompt(
                "Total Copies:"
            );

        if (!totalCopies) {
            return;
        }

        const book = {
            id:
                generateId(
                    "BOOK"
                ),

            title:
                title.trim(),

            author:
                author.trim(),

            totalCopies:
                Number(
                    totalCopies
                ),

            borrowedCopies: 0,

            createdAt:
                new Date()
                    .toISOString()
        };

        validateBook(book);

        state.books.push(book);

        addLog(
            "Book Added",
            book.title
        );

        saveData();

        renderInventory();

        if (
            typeof renderDashboard ===
            "function"
        ) {

            renderDashboard();

        }

        if (
            typeof populateBookDropdown ===
            "function"
        ) {

            populateBookDropdown();

        }

        showToast(
            "Book added successfully.",
            "success"
        );

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}

function editBook(bookId) {

    const book =
        state.books.find(
            b =>
                b.id === bookId
        );

    if (!book) {
        return;
    }

    try {

        const title =
            prompt(
                "Book Title:",
                book.title
            );

        if (!title) {
            return;
        }

        const author =
            prompt(
                "Author:",
                book.author
            );

        if (!author) {
            return;
        }

        const totalCopies =
            prompt(
                "Total Copies:",
                book.totalCopies
            );

        if (!totalCopies) {
            return;
        }

        const updatedBook = {
            ...book,

            title:
                title.trim(),

            author:
                author.trim(),

            totalCopies:
                Number(
                    totalCopies
                )
        };

        validateBook(
            updatedBook
        );

        Object.assign(
            book,
            updatedBook
        );

        addLog(
            "Book Updated",
            book.title
        );

        saveData();

        renderInventory();

        if (
            typeof renderDashboard ===
            "function"
        ) {

            renderDashboard();

        }

        if (
            typeof populateBookDropdown ===
            "function"
        ) {

            populateBookDropdown();

        }

        showToast(
            "Book updated.",
            "success"
        );

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}

function deleteBook(bookId) {

    const book =
        state.books.find(
            b =>
                b.id === bookId
        );

    if (!book) {
        return;
    }

    const activeLoanExists =
        state.activeLoans.some(
            loan =>
                loan.bookId ===
                bookId
        );

    if (
        activeLoanExists
    ) {

        showToast(
            "Cannot delete a book with active loans.",
            "warning"
        );

        return;

    }

    const confirmed =
        confirm(
            `Delete "${book.title}" ?`
        );

    if (!confirmed) {
        return;
    }

    state.books =
        state.books.filter(
            b =>
                b.id !== bookId
        );

    addLog(
        "Book Deleted",
        book.title
    );

    saveData();

    renderInventory();

    if (
        typeof renderDashboard ===
        "function"
    ) {

        renderDashboard();

    }

    if (
        typeof populateBookDropdown ===
        "function"
    ) {

        populateBookDropdown();

    }

    showToast(
        "Book deleted.",
        "success"
    );

}