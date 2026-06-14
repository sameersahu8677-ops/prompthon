/* ===================================== */
/* DOM REFERENCES */
/* ===================================== */

const elements = {
    navButtons: document.querySelectorAll(".nav-btn"),
    sections: document.querySelectorAll(".content-section"),

    currentPageTitle: document.getElementById("current-page-title"),

    toastContainer: document.getElementById("toast-container"),
    globalAlertContainer: document.getElementById("global-alert-container"),

    loadingOverlay: document.getElementById("loading-overlay"),

    modalOverlay: document.getElementById("modal-overlay"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalFooter: document.getElementById("modal-footer"),
    modalCloseBtn: document.getElementById("modal-close-btn"),

    currentDate: document.getElementById("current-date"),
    systemStatus: document.getElementById("system-status")
};

/* ===================================== */
/* GLOBAL STATE */
/* ===================================== */

const appState = {
    books: [],
    activeLoans: [],
    loanHistory: [],
    logs: [],
    selectedLoan: null
};

/* ===================================== */
/* API CONFIG */
/* ===================================== */

const API_BASE = "";

/* ===================================== */
/* UTILITY FUNCTIONS */
/* ===================================== */

function formatDate(dateValue) {
    if (!dateValue) return "--";

    const date = new Date(dateValue);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function generateId(prefix = "ID") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function showLoading(message = "Loading...") {
    const loadingMessage =
        document.getElementById("loading-message");

    if (loadingMessage) {
        loadingMessage.textContent = message;
    }

    elements.loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
    elements.loadingOverlay.classList.add("hidden");
}

function showToast(message, type = "info") {
    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

function showAlert(message) {
    const alertBox = document.createElement("div");

    alertBox.className = "global-alert";
    alertBox.textContent = message;

    elements.globalAlertContainer.innerHTML = "";
    elements.globalAlertContainer.appendChild(alertBox);

    setTimeout(() => {
        alertBox.remove();
    }, 5000);
}

function openModal(title, bodyHTML, footerHTML = "") {
    elements.modalTitle.textContent = title;

    elements.modalBody.innerHTML = bodyHTML;
    elements.modalFooter.innerHTML = footerHTML;

    elements.modalOverlay.classList.remove("hidden");
}

function closeModal() {
    elements.modalOverlay.classList.add("hidden");

    elements.modalBody.innerHTML = "";
    elements.modalFooter.innerHTML = "";
}

/* ===================================== */
/* API SERVICE */
/* ===================================== */

const apiService = {

    async fetchLibraryData() {

        const data = JSON.parse(
            localStorage.getItem("libraryData")
        );

        return data || {
            books: [],
            activeLoans: [],
            loanHistory: [],
            logs: []
        };
    },

    async refreshLibraryData() {

        const data = await this.fetchLibraryData();

        appState.books = data.books || [];
        appState.activeLoans = data.activeLoans || [];
        appState.loanHistory = data.loanHistory || [];
        appState.logs = data.logs || [];

        return data;
    },

    async saveData() {

        localStorage.setItem(
            "libraryData",
            JSON.stringify({
                books: appState.books,
                activeLoans: appState.activeLoans,
                loanHistory: appState.loanHistory,
                logs: appState.logs
            })
        );

    },

    async createBook(bookData) {

        const book = {
            id: generateId("BOOK"),
            title: bookData.title,
            author: bookData.author,
            totalCopies: Number(bookData.totalCopies),
            borrowedCopies: 0,
            createdAt: new Date().toISOString()
        };

        appState.books.push(book);

        await this.saveData();

        return book;
    },

    async updateBook(bookId, updatedData) {

        const book =
            appState.books.find(
                b => b.id === bookId
            );

        if (!book) {
            throw new Error("Book not found");
        }

        Object.assign(book, updatedData);

        await this.saveData();

        return book;
    },

    async deleteBook(bookId) {

        appState.books =
            appState.books.filter(
                b => b.id !== bookId
            );

        await this.saveData();

        return { success: true };
    },

    async checkoutBook() {
        throw new Error(
            "Checkout not implemented yet."
        );
    },

    async returnBook() {
        throw new Error(
            "Return not implemented yet."
        );
    },

    async searchLoans() {
        return [];
    }

};

/* ===================================== */
/* NAVIGATION SYSTEM */
/* ===================================== */

function switchSection(sectionName) {

    elements.sections.forEach(section => {
        section.classList.remove("active-section");
        section.classList.add("hidden");
    });

    elements.navButtons.forEach(button => {
        button.classList.remove("active");
    });

    const targetSection =
        document.getElementById(
            `${sectionName}-section`
        );

    const activeButton =
        document.querySelector(
            `[data-section="${sectionName}"]`
        );

    if (targetSection) {
        targetSection.classList.remove("hidden");
        targetSection.classList.add("active-section");
    }

    if (activeButton) {
        activeButton.classList.add("active");
    }

    elements.currentPageTitle.textContent =
        sectionName.charAt(0).toUpperCase() +
        sectionName.slice(1);
}

/* ===================================== */
/* INITIALIZATION */
/* ===================================== */

async function initializeApplication() {

    try {

        showLoading("Loading Library Data...");

        await apiService.refreshLibraryData();

        elements.currentDate.textContent =
            formatDate(new Date());

        elements.systemStatus.textContent =
            "🟢 Connected";

        showToast(
            "Library data loaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        elements.systemStatus.textContent =
            "🔴 Offline";

        showAlert(
            "Unable to load library data."
        );

    } finally {

        hideLoading();

    }


}

/* ===================================== */
/* INVENTORY ELEMENTS */
/* ===================================== */

const inventoryElements = {
    inventoryTableBody: document.getElementById("inventory-table-body"),
    inventorySearch: document.getElementById("inventory-search"),
    addBookBtn: document.getElementById("add-book-btn"),
    inventoryEmptyState: document.getElementById("inventory-empty-state"),

    totalBooks: document.getElementById("total-books-value"),
    availableBooks: document.getElementById("available-books-value"),
    borrowedBooks: document.getElementById("borrowed-books-value"),
    activeLoans: document.getElementById("active-loans-value"),
    overdueLoans: document.getElementById("overdue-loans-value"),
    totalFine: document.getElementById("total-fine-value"),

    recentLoansContainer: document.getElementById("recent-loans-container"),
    recentReturnsContainer: document.getElementById("recent-returns-container"),
    activityTimelineContainer: document.getElementById("activity-timeline-container")
};

/* ===================================== */
/* VALIDATION */
/* ===================================== */

function validateBook(bookData) {

    const title = bookData.title?.trim();
    const author = bookData.author?.trim();
    const totalCopies = Number(bookData.totalCopies);

    if (!title) {
        throw new Error("Book title is required.");
    }

    if (!author) {
        throw new Error("Author name is required.");
    }

    if (
        Number.isNaN(totalCopies) ||
        totalCopies < 1
    ) {
        throw new Error(
            "Total copies must be at least 1."
        );
    }

    return true;
}

/* ===================================== */
/* STATUS HELPERS */
/* ===================================== */

function getBookStatus(book) {

    const available =
        book.totalCopies - book.borrowedCopies;

    if (available <= 0) {
        return {
            label: "Out Of Stock",
            className: "status-out-of-stock"
        };
    }

    if (available <= 2) {
        return {
            label: "Low Stock",
            className: "status-low-stock"
        };
    }

    return {
        label: "Available",
        className: "status-available"
    };
}

/* ===================================== */
/* INVENTORY RENDERING */
/* ===================================== */

function renderInventory(searchTerm = "") {

    if (!inventoryElements.inventoryTableBody) {
        return;
    }

    const query = searchTerm
        .toLowerCase()
        .trim();

    const filteredBooks =
        appState.books.filter(book => {

            return (
                book.title
                    .toLowerCase()
                    .includes(query) ||

                book.author
                    .toLowerCase()
                    .includes(query) ||

                String(book.id)
                    .toLowerCase()
                    .includes(query)
            );
        });

    inventoryElements.inventoryTableBody.innerHTML = "";

    if (filteredBooks.length === 0) {

        inventoryElements.inventoryEmptyState
            ?.classList.remove("hidden");

        return;
    }

    inventoryElements.inventoryEmptyState
        ?.classList.add("hidden");

    filteredBooks.forEach(book => {

        const availableCopies =
            book.totalCopies -
            book.borrowedCopies;

        const status =
            getBookStatus(book);

        const row =
            document.createElement("tr");

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

        inventoryElements.inventoryTableBody
            .appendChild(row);

    });

}

/* ===================================== */
/* DASHBOARD RENDERING */
/* ===================================== */

function renderDashboard() {

    const totalBooks =
        appState.books.reduce(
            (sum, book) =>
                sum + book.totalCopies,
            0
        );

    const borrowedBooks =
        appState.books.reduce(
            (sum, book) =>
                sum + book.borrowedCopies,
            0
        );

    const availableBooks =
        totalBooks - borrowedBooks;

    const overdueLoans =
        appState.activeLoans.filter(loan => {

            return (
                new Date() >
                new Date(loan.dueDate)
            );

        }).length;

    const totalFineCollected =
        appState.loanHistory.reduce(
            (sum, loan) =>
                sum + Number(loan.fine || 0),
            0
        );

    inventoryElements.totalBooks.textContent =
        totalBooks;

    inventoryElements.availableBooks.textContent =
        availableBooks;

    inventoryElements.borrowedBooks.textContent =
        borrowedBooks;

    inventoryElements.activeLoans.textContent =
        appState.activeLoans.length;

    inventoryElements.overdueLoans.textContent =
        overdueLoans;

    inventoryElements.totalFine.textContent =
        `₹${totalFineCollected.toFixed(2)}`;

}

/* ===================================== */
/* RECENT LOANS */
/* ===================================== */

function renderRecentLoans() {

    if (!inventoryElements.recentLoansContainer) {
        return;
    }

    const loans =
        [...appState.activeLoans]
            .slice(-5)
            .reverse();

    if (!loans.length) {

        inventoryElements.recentLoansContainer.innerHTML = `
            <div class="empty-state">
                No recent loans available.
            </div>
        `;

        return;
    }

    inventoryElements.recentLoansContainer.innerHTML =
        loans.map(loan => `
            <div class="activity-item">
                <strong>${loan.loanId}</strong>
                <br>
                Student: ${loan.studentId}
            </div>
        `).join("");

}

/* ===================================== */
/* RECENT RETURNS */
/* ===================================== */

function renderRecentReturns() {

    if (!inventoryElements.recentReturnsContainer) {
        return;
    }

    const returns =
        [...appState.loanHistory]
            .slice(-5)
            .reverse();

    if (!returns.length) {

        inventoryElements.recentReturnsContainer.innerHTML = `
            <div class="empty-state">
                No recent returns available.
            </div>
        `;

        return;
    }

    inventoryElements.recentReturnsContainer.innerHTML =
        returns.map(item => `
            <div class="activity-item">
                <strong>${item.loanId}</strong>
                <br>
                Fine: ₹${item.fine}
            </div>
        `).join("");

}

/* ===================================== */
/* ACTIVITY TIMELINE */
/* ===================================== */

function renderActivityTimeline() {

    if (!inventoryElements.activityTimelineContainer) {
        return;
    }

    const logs =
        [...appState.logs]
            .slice(-10)
            .reverse();

    if (!logs.length) {

        inventoryElements.activityTimelineContainer.innerHTML = `
            <div class="empty-state">
                No recent activity available.
            </div>
        `;

        return;
    }

    inventoryElements.activityTimelineContainer.innerHTML =
        logs.map(log => `
            <div class="activity-item">
                <strong>${log.action}</strong>
                <br>
                <small>${log.timestamp}</small>
            </div>
        `).join("");

}

/* ===================================== */
/* LOGGING */
/* ===================================== */

function addLog(action, description) {

    const logEntry = {
        timestamp: formatDate(new Date()),
        action,
        description
    };

    appState.logs.unshift(logEntry);

    if (appState.logs.length > 500) {
        appState.logs.length = 500;
    }

}

/* ===================================== */
/* BOOK MANAGEMENT */
/* ===================================== */

async function addBook(bookData) {

    validateBook(bookData);

    showLoading("Adding book...");

    try {

        await apiService.createBook(bookData);

        await apiService.refreshLibraryData();

        addLog(
            "Book Added",
            `${bookData.title} added`
        );

        renderInventory();
        renderDashboard();
        renderActivityTimeline();

        showToast(
            "Book added successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}

async function editBook(
    bookId,
    updatedData
) {

    validateBook(updatedData);

    showLoading("Updating book...");

    try {

        await apiService.updateBook(
            bookId,
            updatedData
        );

        await apiService.refreshLibraryData();

        renderInventory();
        renderDashboard();

        showToast(
            "Book updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}

async function deleteBook(bookId) {

    const activeLoanExists =
        appState.activeLoans.some(
            loan => loan.bookId === bookId
        );

    if (activeLoanExists) {

        showToast(
            "Cannot delete a book with active loans.",
            "warning"
        );

        return;
    }

    showLoading("Deleting book...");

    try {

        await apiService.deleteBook(bookId);

        await apiService.refreshLibraryData();

        renderInventory();
        renderDashboard();

        showToast(
            "Book deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}


/* ===================================== */
/* VALIDATION */
/* ===================================== */

function validateBook(bookData) {

    const title = bookData.title?.trim();
    const author = bookData.author?.trim();
    const totalCopies = Number(bookData.totalCopies);

    if (!title) {
        throw new Error("Book title is required.");
    }

    if (!author) {
        throw new Error("Author name is required.");
    }

    if (
        Number.isNaN(totalCopies) ||
        totalCopies < 1
    ) {
        throw new Error(
            "Total copies must be at least 1."
        );
    }

    return true;
}

/* ===================================== */
/* STATUS HELPERS */
/* ===================================== */

function getBookStatus(book) {

    const available =
        book.totalCopies - book.borrowedCopies;

    if (available <= 0) {
        return {
            label: "Out Of Stock",
            className: "status-out-of-stock"
        };
    }

    if (available <= 2) {
        return {
            label: "Low Stock",
            className: "status-low-stock"
        };
    }

    return {
        label: "Available",
        className: "status-available"
    };
}

/* ===================================== */
/* INVENTORY RENDERING */
/* ===================================== */

function renderInventory(searchTerm = "") {

    if (!inventoryElements.inventoryTableBody) {
        return;
    }

    const query = searchTerm
        .toLowerCase()
        .trim();

    const filteredBooks =
        appState.books.filter(book => {

            return (
                book.title
                    .toLowerCase()
                    .includes(query) ||

                book.author
                    .toLowerCase()
                    .includes(query) ||

                String(book.id)
                    .toLowerCase()
                    .includes(query)
            );
        });

    inventoryElements.inventoryTableBody.innerHTML = "";

    if (filteredBooks.length === 0) {

        inventoryElements.inventoryEmptyState
            ?.classList.remove("hidden");

        return;
    }

    inventoryElements.inventoryEmptyState
        ?.classList.add("hidden");

    filteredBooks.forEach(book => {

        const availableCopies =
            book.totalCopies -
            book.borrowedCopies;

        const status =
            getBookStatus(book);

        const row =
            document.createElement("tr");

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

        inventoryElements.inventoryTableBody
            .appendChild(row);

    });

}

/* ===================================== */
/* DASHBOARD RENDERING */
/* ===================================== */

function renderDashboard() {

    const totalBooks =
        appState.books.reduce(
            (sum, book) =>
                sum + book.totalCopies,
            0
        );

    const borrowedBooks =
        appState.books.reduce(
            (sum, book) =>
                sum + book.borrowedCopies,
            0
        );

    const availableBooks =
        totalBooks - borrowedBooks;

    const overdueLoans =
        appState.activeLoans.filter(loan => {

            return (
                new Date() >
                new Date(loan.dueDate)
            );

        }).length;

    const totalFineCollected =
        appState.loanHistory.reduce(
            (sum, loan) =>
                sum + Number(loan.fine || 0),
            0
        );

    inventoryElements.totalBooks.textContent =
        totalBooks;

    inventoryElements.availableBooks.textContent =
        availableBooks;

    inventoryElements.borrowedBooks.textContent =
        borrowedBooks;

    inventoryElements.activeLoans.textContent =
        appState.activeLoans.length;

    inventoryElements.overdueLoans.textContent =
        overdueLoans;

    inventoryElements.totalFine.textContent =
        `₹${totalFineCollected.toFixed(2)}`;

}

/* ===================================== */
/* RECENT LOANS */
/* ===================================== */

function renderRecentLoans() {

    if (!inventoryElements.recentLoansContainer) {
        return;
    }

    const loans =
        [...appState.activeLoans]
            .slice(-5)
            .reverse();

    if (!loans.length) {

        inventoryElements.recentLoansContainer.innerHTML = `
            <div class="empty-state">
                No recent loans available.
            </div>
        `;

        return;
    }

    inventoryElements.recentLoansContainer.innerHTML =
        loans.map(loan => `
            <div class="activity-item">
                <strong>${loan.loanId}</strong>
                <br>
                Student: ${loan.studentId}
            </div>
        `).join("");

}

/* ===================================== */
/* RECENT RETURNS */
/* ===================================== */

function renderRecentReturns() {

    if (!inventoryElements.recentReturnsContainer) {
        return;
    }

    const returns =
        [...appState.loanHistory]
            .slice(-5)
            .reverse();

    if (!returns.length) {

        inventoryElements.recentReturnsContainer.innerHTML = `
            <div class="empty-state">
                No recent returns available.
            </div>
        `;

        return;
    }

    inventoryElements.recentReturnsContainer.innerHTML =
        returns.map(item => `
            <div class="activity-item">
                <strong>${item.loanId}</strong>
                <br>
                Fine: ₹${item.fine}
            </div>
        `).join("");

}

/* ===================================== */
/* ACTIVITY TIMELINE */
/* ===================================== */

function renderActivityTimeline() {

    if (!inventoryElements.activityTimelineContainer) {
        return;
    }

    const logs =
        [...appState.logs]
            .slice(-10)
            .reverse();

    if (!logs.length) {

        inventoryElements.activityTimelineContainer.innerHTML = `
            <div class="empty-state">
                No recent activity available.
            </div>
        `;

        return;
    }

    inventoryElements.activityTimelineContainer.innerHTML =
        logs.map(log => `
            <div class="activity-item">
                <strong>${log.action}</strong>
                <br>
                <small>${log.timestamp}</small>
            </div>
        `).join("");

}

/* ===================================== */
/* LOGGING */
/* ===================================== */

function addLog(action, description) {

    const logEntry = {
        timestamp: formatDate(new Date()),
        action,
        description
    };

    appState.logs.unshift(logEntry);

    if (appState.logs.length > 500) {
        appState.logs.length = 500;
    }

}

/* ===================================== */
/* BOOK MANAGEMENT */
/* ===================================== */

async function addBook(bookData) {

    validateBook(bookData);

    showLoading("Adding book...");

    try {

        await apiService.createBook(bookData);


        addLog(
            "Book Added",
            `${bookData.title} added`
        );

        renderInventory();
        renderDashboard();
        renderActivityTimeline();

        showToast(
            "Book added successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}

async function editBook(
    bookId,
    updatedData
) {

    validateBook(updatedData);

    showLoading("Updating book...");

    try {

        await apiService.updateBook(
            bookId,
            updatedData
        );

        await apiService.refreshLibraryData();

        renderInventory();
        renderDashboard();

        showToast(
            "Book updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}

async function deleteBook(bookId) {

    const activeLoanExists =
        appState.activeLoans.some(
            loan => loan.bookId === bookId
        );

    if (activeLoanExists) {

        showToast(
            "Cannot delete a book with active loans.",
            "warning"
        );

        return;
    }

    showLoading("Deleting book...");

    try {

        await apiService.deleteBook(bookId);

        await apiService.refreshLibraryData();

        renderInventory();
        renderDashboard();

        showToast(
            "Book deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}

/* ===================================== */
/* RETURNS ELEMENTS */
/* ===================================== */

const returnElements = {
    searchInput: document.getElementById(
        "return-search-input"
    ),

    searchButton: document.getElementById(
        "search-loan-btn"
    ),

    processReturnButton:
        document.getElementById(
            "process-return-btn"
        ),

    loanDetailsContent:
        document.getElementById(
            "loan-details-content"
        ),

    fineBreakdownContent:
        document.getElementById(
            "fine-breakdown-content"
        )
};

/* ===================================== */
/* HISTORY ELEMENTS */
/* ===================================== */

const historyElements = {
    tableBody:
        document.getElementById(
            "history-table-body"
        )
};

/* ===================================== */
/* FINE SERVICE */
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
        Math.max(overdueDays - 7, 0);

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

    const selectedBook =
        appState.books.find(
            book => book.id === data.bookId
        );

    if (!selectedBook) {
        throw new Error(
            "Selected book does not exist."
        );
    }

    const available =
        selectedBook.totalCopies -
        selectedBook.borrowedCopies;

    if (available <= 0) {
        throw new Error(
            "No copies available."
        );
    }

    return true;
}

/* ===================================== */
/* CHECKOUT */
/* ===================================== */

async function processCheckout(
    checkoutData
) {

    validateCheckout(checkoutData);

    showLoading(
        "Issuing book..."
    );

    try {

        await apiService.checkoutBook(
            checkoutData
        );

        await apiService.refreshLibraryData();

        renderInventory();
        renderDashboard();
        renderRecentLoans();

        showToast(
            "Book issued successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}

/* ===================================== */
/* LOAN SEARCH */
/* ===================================== */

async function searchLoans() {

    const query =
        returnElements.searchInput.value
            .trim();

    if (!query) {

        showToast(
            "Enter Loan ID or Student ID.",
            "warning"
        );

        return;
    }

    try {

        const matches =
            await apiService.searchLoans(
                query
            );

        if (!matches.length) {

            showToast(
                "No matching loans found.",
                "warning"
            );

            return;
        }

        if (matches.length === 1) {

            selectLoan(matches[0]);

            return;
        }

        openModal(
            "Select Loan",
            matches.map(loan => `
                <button
                    class="btn-primary select-loan-btn"
                    data-loan-id="${loan.loanId}"
                    style="
                        display:block;
                        width:100%;
                        margin-bottom:10px;
                    ">
                    ${loan.loanId}
                    - ${loan.studentId}
                </button>
            `).join("")
        );

        setTimeout(() => {

            document
                .querySelectorAll(
                    ".select-loan-btn"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const loan =
                                matches.find(
                                    item =>
                                        item.loanId ===
                                        button.dataset.loanId
                                );

                            if (loan) {
                                selectLoan(loan);
                                closeModal();
                            }

                        }
                    );

                });

        }, 0);

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

}

/* ===================================== */
/* LOAN SELECTION */
/* ===================================== */

function selectLoan(loan) {

    appState.selectedLoan =
        loan;

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
                (1000 * 60 * 60 * 24)
            ),
            0
        );

    const fine =
        calculateFine(
            overdueDays
        );

    returnElements.loanDetailsContent
        .innerHTML = `
            <p><strong>Loan ID:</strong> ${loan.loanId}</p>
            <p><strong>Book ID:</strong> ${loan.bookId}</p>
            <p><strong>Student ID:</strong> ${loan.studentId}</p>
            <p><strong>Borrow Date:</strong> ${formatDate(loan.borrowDate)}</p>
            <p><strong>Due Date:</strong> ${formatDate(loan.dueDate)}</p>
            <p><strong>Overdue Days:</strong> ${overdueDays}</p>
        `;

    returnElements.fineBreakdownContent
        .innerHTML = `
            <p>Overdue Days: ${fine.overdueDays}</p>
            <p>First Tier Days: ${fine.firstTierDays}</p>
            <p>First Tier Fine: ₹${fine.firstTierFine.toFixed(2)}</p>
            <p>Second Tier Days: ${fine.secondTierDays}</p>
            <p>Second Tier Fine: ₹${fine.secondTierFine.toFixed(2)}</p>
            <p><strong>Total Fine: ₹${fine.totalFine.toFixed(2)}</strong></p>
        `;

}

/* ===================================== */
/* RETURN BOOK */
/* ===================================== */

async function processReturn() {

    if (!appState.selectedLoan) {

        showToast(
            "Select a loan first.",
            "warning"
        );

        return;
    }

    showLoading(
        "Processing return..."
    );

    try {

        await apiService.returnBook({
            loanId:
                appState.selectedLoan.loanId
        });

        await apiService.refreshLibraryData();

        renderInventory();
        renderDashboard();
        renderHistory();
        renderRecentReturns();

        appState.selectedLoan =
            null;

        showToast(
            "Book returned successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    } finally {

        hideLoading();

    }

}

/* ===================================== */
/* HISTORY */
/* ===================================== */

function renderHistory() {

    if (!historyElements.tableBody) {
        return;
    }

    historyElements.tableBody.innerHTML =
        "";

    appState.loanHistory.forEach(
        record => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${record.loanId}</td>
                <td>${record.bookId}</td>
                <td>${record.bookTitle || "-"}</td>
                <td>${record.studentId}</td>
                <td>${formatDate(record.borrowDate)}</td>
                <td>${formatDate(record.returnDate)}</td>
                <td>${record.overdueDays}</td>
                <td>₹${Number(record.fine).toFixed(2)}</td>
            `;

            historyElements.tableBody
                .appendChild(row);

        });

}

/* ===================================== */
/* EVENT REGISTRATION */
/* ===================================== */

function registerEvents() {

    inventoryElements.addBookBtn?.addEventListener("click", () => {

        const title = prompt("Enter Book Title:");

        if (!title) return;

        const author = prompt("Enter Author Name:");

        if (!author) return;

        const totalCopies = prompt("Enter Total Copies:");

        if (!totalCopies) return;

        addBook({
            title,
            author,
            totalCopies: Number(totalCopies)
        });

    });

    elements.navButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    switchSection(
                        button.dataset.section
                    );

                }
            );

        }
    );

    elements.modalCloseBtn
        ?.addEventListener(
            "click",
            closeModal
        );

    returnElements.searchButton
        ?.addEventListener(
            "click",
            searchLoans
        );

    returnElements.processReturnButton
        ?.addEventListener(
            "click",
            processReturn
        );

}

/* ===================================== */
/* FINAL STARTUP */
/* ===================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await initializeApplication();

        renderInventory();
        renderDashboard();
        renderRecentLoans();
        renderRecentReturns();
        renderActivityTimeline();
        renderHistory();

        registerEvents();

    }
);

