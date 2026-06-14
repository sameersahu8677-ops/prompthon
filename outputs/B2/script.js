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

const API_BASE = "/api";

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
        const response = await fetch(`${API_BASE}/library`);

        if (!response.ok) {
            throw new Error("Failed to load library data.");
        }

        return await response.json();
    },

    async refreshLibraryData() {
        const data = await this.fetchLibraryData();

        appState.books = data.books || [];
        appState.activeLoans = data.activeLoans || [];
        appState.loanHistory = data.loanHistory || [];
        appState.logs = data.logs || [];

        return data;
    },

    async createBook(bookData) {
        const response = await fetch(`${API_BASE}/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            throw new Error("Unable to create book.");
        }

        return await response.json();
    },

    async updateBook(bookId, updatedData) {
        const response = await fetch(
            `${API_BASE}/books/${bookId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            }
        );

        if (!response.ok) {
            throw new Error("Unable to update book.");
        }

        return await response.json();
    },

    async deleteBook(bookId) {
        const response = await fetch(
            `${API_BASE}/books/${bookId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to delete book.");
        }

        return await response.json();
    },

    async checkoutBook(checkoutData) {
        const response = await fetch(
            `${API_BASE}/checkout`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(checkoutData)
            }
        );

        if (!response.ok) {
            throw new Error("Checkout failed.");
        }

        return await response.json();
    },

    async returnBook(returnData) {
        const response = await fetch(
            `${API_BASE}/return`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(returnData)
            }
        );

        if (!response.ok) {
            throw new Error("Return processing failed.");
        }

        return await response.json();
    },

    async searchLoans(query) {
        const response = await fetch(
            `${API_BASE}/library`
        );

        if (!response.ok) {
            throw new Error("Unable to search loans.");
        }

        const data = await response.json();

        const loans = data.activeLoans || [];

        return loans.filter(loan =>
            loan.loanId.includes(query) ||
            loan.studentId.includes(query)
        );
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