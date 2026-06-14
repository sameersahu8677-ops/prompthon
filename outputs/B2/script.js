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

/* ===================================== */
/* CHECKOUT DOM REFERENCES */
/* ===================================== */

const checkoutElements = {
    form: document.getElementById("checkout-form"),
    bookSelect: document.getElementById("checkout-book-select"),
    studentId: document.getElementById("student-id"),
    dueDate: document.getElementById("due-date")
};

const returnElements = {
    searchInput: document.getElementById("return-search-input"),
    searchButton: document.getElementById("search-loan-btn"),
    processReturnButton: document.getElementById("process-return-btn"),

    loanDetailsContent:
        document.getElementById("loan-details-content"),

    fineBreakdownContent:
        document.getElementById("fine-breakdown-content")
};

/* ===================================== */
/* CURRENTLY SELECTED LOAN */
/* ===================================== */

let selectedLoan = null;

/* ===================================== */
/* CHECKOUT DROPDOWN */
/* ===================================== */

function populateBookDropdown() {

    if (!checkoutElements.bookSelect) {
        return;
    }

    checkoutElements.bookSelect.innerHTML = `
        <option value="">
            Select Book
        </option>
    `;

    state.books.forEach(book => {

        const availableCopies =
            book.totalCopies -
            book.borrowedCopies;

        if (availableCopies <= 0) {
            return;
        }

        const option =
            document.createElement("option");

        option.value = book.id;

        option.textContent = `
${book.title}
(Available: ${availableCopies})
        `.trim();

        checkoutElements.bookSelect
            .appendChild(option);

    });

}

/* ===================================== */
/* CHECKOUT VALIDATION */
/* ===================================== */

function validateCheckout(data) {

    if (!data.bookId) {

        throw new Error(
            "Please select a book."
        );

    }

    if (!data.studentId?.trim()) {

        throw new Error(
            "Student ID is required."
        );

    }

    if (!data.dueDate) {

        throw new Error(
            "Due date is required."
        );

    }

    const book =
        state.books.find(
            b => b.id === data.bookId
        );

    if (!book) {

        throw new Error(
            "Book not found."
        );

    }

    const available =
        book.totalCopies -
        book.borrowedCopies;

    if (available <= 0) {

        throw new Error(
            "No copies available."
        );

    }

}

/* ===================================== */
/* CHECKOUT BOOK */
/* ===================================== */

function checkoutBook(data) {

    validateCheckout(data);

    const book =
        state.books.find(
            b => b.id === data.bookId
        );

    book.borrowedCopies++;

    const loan = {

        loanId:
            generateId("LOAN"),

        bookId:
            book.id,

        bookTitle:
            book.title,

        studentId:
            data.studentId.trim(),

        borrowDate:
            new Date().toISOString(),

        dueDate:
            data.dueDate

    };

    state.activeLoans.push(loan);

    addLog(
        "Book Issued",
        `${book.title} → ${loan.studentId}`
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
        typeof renderRecentLoans ===
        "function"
    ) {
        renderRecentLoans();
    }

    populateBookDropdown();

    showToast(
        "Book issued successfully.",
        "success"
    );

}

/* ===================================== */
/* CHECKOUT FORM SUBMIT */
/* ===================================== */

function handleCheckoutSubmit(event) {

    event.preventDefault();

    try {

        checkoutBook({

            bookId:
                checkoutElements.bookSelect.value,

            studentId:
                checkoutElements.studentId.value,

            dueDate:
                checkoutElements.dueDate.value

        });

        checkoutElements.form.reset();

    } catch (error) {

        showToast(
            error.message,
            "error"
        );

    }

}

/* ===================================== */
/* FINE ENGINE */
/* ===================================== */

function calculateFine(overdueDays) {

    if (overdueDays <= 0) {

        return {

            overdueDays: 0,

            firstTierDays: 0,
            firstTierFine: 0,

            secondTierDays: 0,
            secondTierFine: 0,

            totalFine: 0

        };

    }

    const firstTierDays =
        Math.min(overdueDays, 7);

    const secondTierDays =
        Math.max(
            overdueDays - 7,
            0
        );

    const firstTierFine =
        firstTierDays * 1;

    const secondTierFine =
        secondTierDays * 2.5;

    const totalFine =
        firstTierFine +
        secondTierFine;

    return {

        overdueDays,

        firstTierDays,
        firstTierFine,

        secondTierDays,
        secondTierFine,

        totalFine

    };

}

/* ===================================== */
/* SEARCH LOANS */
/* ===================================== */

function searchLoans(query) {

    const normalized =
        query
            .trim()
            .toLowerCase();

    return state.activeLoans.filter(
        loan =>

            loan.loanId
                .toLowerCase()
                .includes(normalized)

            ||

            loan.studentId
                .toLowerCase()
                .includes(normalized)
    );

}

/* ===================================== */
/* DISPLAY LOAN */
/* ===================================== */

function selectLoan(loan) {

    selectedLoan = loan;

    const today =
        new Date();

    const dueDate =
        new Date(loan.dueDate);

    const overdueDays =
        Math.max(
            Math.ceil(
                (
                    today -
                    dueDate
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            ),
            0
        );

    const fine =
        calculateFine(
            overdueDays
        );

    if (
        returnElements.loanDetailsContent
    ) {

        returnElements.loanDetailsContent.innerHTML = `
            <p><strong>Loan ID:</strong> ${loan.loanId}</p>
            <p><strong>Book:</strong> ${loan.bookTitle}</p>
            <p><strong>Student:</strong> ${loan.studentId}</p>
            <p><strong>Borrow Date:</strong> ${formatDate(loan.borrowDate)}</p>
            <p><strong>Due Date:</strong> ${formatDate(loan.dueDate)}</p>
        `;

    }

    if (
        returnElements.fineBreakdownContent
    ) {

        returnElements.fineBreakdownContent.innerHTML = `
            <p>Overdue Days: ${fine.overdueDays}</p>
            <p>First Tier Days: ${fine.firstTierDays}</p>
            <p>First Tier Fine: ₹${fine.firstTierFine.toFixed(2)}</p>
            <p>Second Tier Days: ${fine.secondTierDays}</p>
            <p>Second Tier Fine: ₹${fine.secondTierFine.toFixed(2)}</p>
            <hr>
            <p><strong>Total Fine: ₹${fine.totalFine.toFixed(2)}</strong></p>
        `;

    }

}

/* ===================================== */
/* HANDLE SEARCH */
/* ===================================== */

function handleLoanSearch() {

    const query =
        returnElements.searchInput.value;

    if (!query.trim()) {

        showToast(
            "Enter Loan ID or Student ID",
            "warning"
        );

        return;

    }

    const matches =
        searchLoans(query);

    if (!matches.length) {

        showToast(
            "No active loans found.",
            "warning"
        );

        return;

    }

    if (matches.length === 1) {

        selectLoan(matches[0]);

        showToast(
            "Loan found.",
            "success"
        );

        return;

    }

    const selectedId =
        prompt(
            matches.map(
                loan =>
                    `${loan.loanId} (${loan.studentId})`
            ).join("\n\n") +
            "\n\nEnter Loan ID:"
        );

    if (!selectedId) {
        return;
    }

    const chosenLoan =
        matches.find(
            loan =>
                loan.loanId === selectedId
        );

    if (!chosenLoan) {

        showToast(
            "Invalid Loan ID.",
            "error"
        );

        return;

    }

    selectLoan(chosenLoan);

}

/* ===================================== */
/* RETURN BOOK */
/* ===================================== */

function returnBook() {

    if (!selectedLoan) {

        showToast(
            "Select a loan first.",
            "warning"
        );

        return;

    }

    const book =
        state.books.find(
            b =>
                b.id ===
                selectedLoan.bookId
        );

    if (!book) {

        showToast(
            "Book not found.",
            "error"
        );

        return;

    }

    const returnDate =
        new Date();

    const dueDate =
        new Date(
            selectedLoan.dueDate
        );

    const overdueDays =
        Math.max(
            Math.ceil(
                (
                    returnDate -
                    dueDate
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            ),
            0
        );

    const fine =
        calculateFine(
            overdueDays
        );

    book.borrowedCopies =
        Math.max(
            book.borrowedCopies - 1,
            0
        );

    state.activeLoans =
        state.activeLoans.filter(
            loan =>
                loan.loanId !==
                selectedLoan.loanId
        );

    state.loanHistory.push({

        loanId:
            selectedLoan.loanId,

        bookId:
            selectedLoan.bookId,

        bookTitle:
            selectedLoan.bookTitle,

        studentId:
            selectedLoan.studentId,

        borrowDate:
            selectedLoan.borrowDate,

        dueDate:
            selectedLoan.dueDate,

        returnDate:
            returnDate.toISOString(),

        overdueDays,

        fine:
            fine.totalFine

    });

    addLog(
        "Book Returned",
        selectedLoan.bookTitle
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
        typeof renderHistory ===
        "function"
    ) {
        renderHistory();
    }

    if (
        typeof renderRecentReturns ===
        "function"
    ) {
        renderRecentReturns();
    }

    populateBookDropdown();

    returnElements.loanDetailsContent.innerHTML =
        "";

    returnElements.fineBreakdownContent.innerHTML =
        "";

    selectedLoan = null;

    showToast(
        `Returned successfully. Fine: ₹${fine.totalFine.toFixed(2)}`,
        "success"
    );

}

