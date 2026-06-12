javascript
/* ========================================
   APPLICATION CONSTANTS
======================================== */

const CATEGORIES = Object.freeze([
    "Food",
    "Entertainment",
    "Books/Stationery"
]);

const RISK_LEVELS = Object.freeze({
    SAFE: "SAFE",
    WATCH: "WATCH",
    RISK: "RISK"
});

/* ========================================
   STORAGE KEYS
======================================== */

const STORAGE_KEYS = Object.freeze({
    APP_DATA: "smart-budget-manager"
});

/* ========================================
   DOM REFERENCES
======================================== */

const DOM = {
    // Budget
    budgetForm: document.getElementById("budget-form"),
    budgetInput: document.getElementById("budget-input"),
    budgetSubmitBtn: document.getElementById("budget-submit-btn"),
    budgetError: document.getElementById("budget-error"),

    // Dashboard
    dashboard: document.getElementById("dashboard"),
    currentMonth: document.getElementById("current-month"),

    // Budget Summary
    totalBudget: document.getElementById("total-budget"),
    totalSpent: document.getElementById("total-spent"),
    remainingBudget: document.getElementById("remaining-budget"),
    overspendingMessage: document.getElementById("overspending-message"),

    // Progress
    budgetProgress: document.getElementById("budget-progress"),
    budgetProgressFill: document.getElementById("budget-progress-fill"),
    budgetPercentage: document.getElementById("budget-percentage"),

    // Risk
    riskStatus: document.getElementById("risk-status"),
    riskStatusMessage: document.getElementById("risk-status-message"),

    // Velocity
    velocityCard: document.getElementById("velocity-card"),
    velocityMessage: document.getElementById("velocity-message"),
    projectedSpend: document.getElementById("projected-spend"),
    daysToExhaustion: document.getElementById("days-to-exhaustion"),
    suggestedDailyLimit: document.getElementById("suggested-daily-limit"),

    // Category Analytics
    foodTotal: document.getElementById("food-total"),
    foodPercent: document.getElementById("food-percent"),

    entertainmentTotal: document.getElementById("entertainment-total"),
    entertainmentPercent: document.getElementById("entertainment-percent"),

    booksTotal: document.getElementById("books-total"),
    booksPercent: document.getElementById("books-percent"),

    // Expense Form
    expenseForm: document.getElementById("expense-form"),
    expenseAmount: document.getElementById("expense-amount"),
    expenseCategory: document.getElementById("expense-category"),
    expenseDate: document.getElementById("expense-date"),
    expenseSubmitBtn: document.getElementById("expense-submit-btn"),
    expenseError: document.getElementById("expense-error"),

    // History
    historyFilter: document.getElementById("history-filter"),
    historyEmptyState: document.getElementById("history-empty-state"),
    historyContent: document.getElementById("history-content"),
    expenseTableBody: document.getElementById("expense-table-body"),

    // Delete Modal
    deleteModal: document.getElementById("delete-modal"),
    confirmDeleteBtn: document.getElementById("confirm-delete-btn"),
    cancelDeleteBtn: document.getElementById("cancel-delete-btn"),

    // Notifications
    notificationContainer: document.getElementById("notification-container")
};

/* ========================================
   UTILITY FUNCTIONS
======================================== */

// Generate a unique expense ID
function generateId() {
    return `${Date.now()}-${crypto.randomUUID()}`;
}

// Safely convert values to numbers
function safeParseNumber(value) {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
}

// Format currency in INR
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(safeParseNumber(amount));
}

// Format percentage values
function formatPercentage(value) {
    return `${safeParseNumber(value).toFixed(1)}%`;
}

/* ========================================
   DATE HELPERS
======================================== */

// Returns YYYY-MM format
function getCurrentMonthKey() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}

// Returns YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split("T")[0];
}

// Total days in current month
function getDaysInCurrentMonth() {
    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();
}

// Current day number in month
function getDaysElapsed() {
    return new Date().getDate();
}

// Remaining days including today excluded
function getRemainingDaysInMonth() {
    return Math.max(
        getDaysInCurrentMonth() - getDaysElapsed(),
        0
    );
}

/* ========================================
   VALIDATION HELPERS
======================================== */

function createValidationResult(valid, message = "") {
    return {
        valid,
        message
    };
}

/* ========================================
   BUDGET VALIDATION
======================================== */

function validateBudget(budgetValue) {
    const budget = safeParseNumber(budgetValue);

    if (budgetValue === "" || budgetValue === null || budgetValue === undefined) {
        return createValidationResult(
            false,
            "Please enter a monthly budget."
        );
    }

    if (budget <= 0) {
        return createValidationResult(
            false,
            "Budget must be greater than zero."
        );
    }

    if (budget > 1000000) {
        return createValidationResult(
            false,
            "Budget exceeds the allowed limit."
        );
    }

    return createValidationResult(true);
}

/* ========================================
   EXPENSE VALIDATION
======================================== */

function validateExpense({
    amount,
    category,
    date
}) {
    const parsedAmount = safeParseNumber(amount);

    if (amount === "" || amount === null || amount === undefined) {
        return createValidationResult(
            false,
            "Please enter an expense amount."
        );
    }

    if (parsedAmount <= 0) {
        return createValidationResult(
            false,
            "Expense amount must be greater than zero."
        );
    }

    if (!CATEGORIES.includes(category)) {
        return createValidationResult(
            false,
            "Please select a valid category."
        );
    }

    if (!date) {
        return createValidationResult(
            false,
            "Please select a valid date."
        );
    }

    if (date > getCurrentDate()) {
        return createValidationResult(
            false,
            "Future dates are not allowed."
        );
    }

    return createValidationResult(true);
}

