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

javascript
/* ========================================
   STORAGE HELPERS
======================================== */

function createDefaultData() {
    const currentMonth = getCurrentMonthKey();

    return {
        currentMonth,
        months: {
            [currentMonth]: {
                budget: 0,
                expenses: []
            }
        }
    };
}

function ensureCurrentMonthExists(data) {
    const currentMonth = getCurrentMonthKey();

    if (!data.months) {
        data.months = {};
    }

    if (!data.months[currentMonth]) {
        data.months[currentMonth] = {
            budget: 0,
            expenses: []
        };
    }

    data.currentMonth = currentMonth;

    return data;
}

function getCurrentMonthData() {
    const data = ensureCurrentMonthExists(loadData());

    saveData(data);

    return data.months[data.currentMonth];
}

/* ========================================
   STORAGE LAYER
======================================== */

function loadData() {
    try {
        const rawData = localStorage.getItem(
            STORAGE_KEYS.APP_DATA
        );

        if (!rawData) {
            return createDefaultData();
        }

        const parsedData = JSON.parse(rawData);

        if (
            typeof parsedData !== "object" ||
            parsedData === null
        ) {
            return createDefaultData();
        }

        return ensureCurrentMonthExists(parsedData);
    } catch (error) {
        console.error("Failed to load data:", error);

        return createDefaultData();
    }
}

function saveData(data) {
    try {
        localStorage.setItem(
            STORAGE_KEYS.APP_DATA,
            JSON.stringify(data)
        );

        return true;
    } catch (error) {
        console.error("Failed to save data:", error);

        return false;
    }
}

function resetData() {
    try {
        localStorage.removeItem(
            STORAGE_KEYS.APP_DATA
        );
    } catch (error) {
        console.error("Failed to reset data:", error);
    }

    return createDefaultData();
}

/* ========================================
   BUDGET CRUD
======================================== */

function setBudget(amount) {
    const validation = validateBudget(amount);

    if (!validation.valid) {
        return validation;
    }

    const data = loadData();

    data.months[data.currentMonth].budget =
        safeParseNumber(amount);

    saveData(data);

    return {
        valid: true,
        message: "Budget updated successfully."
    };
}

function getBudget() {
    return getCurrentMonthData().budget;
}

/* ========================================
   EXPENSE CRUD
======================================== */

function addExpense({
    amount,
    category,
    date
}) {
    const validation = validateExpense({
        amount,
        category,
        date
    });

    if (!validation.valid) {
        return validation;
    }

    const data = loadData();

    const expense = {
        id: generateId(),
        amount: safeParseNumber(amount),
        category,
        date,
        timestamp: Date.now()
    };

    data.months[data.currentMonth]
        .expenses
        .push(expense);

    saveData(data);

    return {
        valid: true,
        message: "Expense added successfully.",
        expense
    };
}

function deleteExpense(expenseId) {
    const data = loadData();

    const monthData =
        data.months[data.currentMonth];

    const originalLength =
        monthData.expenses.length;

    monthData.expenses =
        monthData.expenses.filter(
            expense => expense.id !== expenseId
        );

    const deleted =
        monthData.expenses.length !==
        originalLength;

    if (deleted) {
        saveData(data);
    }

    return {
        success: deleted,
        message: deleted
            ? "Expense deleted successfully."
            : "Expense not found."
    };
}

function getExpenses() {
    const monthData = getCurrentMonthData();

    return [...monthData.expenses].sort(
        (a, b) => b.timestamp - a.timestamp
    );
}

function filterExpenses(category = "All") {
    const expenses = getExpenses();

    if (category === "All") {
        return expenses;
    }

    return expenses.filter(
        expense => expense.category === category
    );
}

/* ========================================
   DELETE MODAL HELPERS
======================================== */

let pendingDeleteExpenseId = null;

function openDeleteModal(expenseId) {
    pendingDeleteExpenseId = expenseId;

    if (DOM.deleteModal) {
        DOM.deleteModal.hidden = false;
    }
}

function closeDeleteModal() {
    pendingDeleteExpenseId = null;

    if (DOM.deleteModal) {
        DOM.deleteModal.hidden = true;
    }
}

javascript
/* ========================================
   ANALYTICS HELPERS
======================================== */

function calculateTotalSpent(expenses) {
    return expenses.reduce(
        (total, expense) => total + safeParseNumber(expense.amount),
        0
    );
}

function calculateRemainingBudget(budget, totalSpent) {
    return budget - totalSpent;
}

function calculateUsagePercentage(budget, totalSpent) {
    if (budget <= 0) {
        return 0;
    }

    return (totalSpent / budget) * 100;
}

function calculateSpendingVelocity(totalSpent, daysElapsed) {
    if (daysElapsed <= 0) {
        return 0;
    }

    return totalSpent / daysElapsed;
}

function calculateProjectedSpend(velocity, daysInMonth) {
    return velocity * daysInMonth;
}

function calculateDaysToExhaustion(
    remainingBudget,
    velocity
) {
    if (
        velocity <= 0 ||
        remainingBudget <= 0
    ) {
        return 0;
    }

    return Math.floor(
        remainingBudget / velocity
    );
}
function calculateSuggestedDailyLimit(
    remainingBudget,
    remainingDays
) {
    if (remainingDays <= 0) {
        return 0;
    }

    return remainingBudget / remainingDays;
}

/* ========================================
   RISK ANALYSIS
======================================== */

function calculateRiskStatus(projectedSpend, budget) {
    if (budget <= 0) {
        return {
            level: RISK_LEVELS.RISK,
            message: "No budget has been set."
        };
    }

    const ninetyPercentThreshold = budget * 0.9;

    if (projectedSpend < ninetyPercentThreshold) {
        return {
            level: RISK_LEVELS.SAFE,
            message: "Your spending is comfortably within budget."
        };
    }

    if (projectedSpend <= budget) {
        return {
            level: RISK_LEVELS.WATCH,
            message: "Monitor your spending to avoid exceeding your budget."
        };
    }

    return {
        level: RISK_LEVELS.RISK,
        message: "At this rate, your budget is likely to be exceeded."
    };
}

/* ========================================
   CATEGORY ANALYTICS
======================================== */

function calculateCategoryBreakdown(expenses) {
    const totalSpent = calculateTotalSpent(expenses);

    const breakdown = {
        Food: {
            amount: 0,
            percentage: 0
        },
        Entertainment: {
            amount: 0,
            percentage: 0
        },
        "Books/Stationery": {
            amount: 0,
            percentage: 0
        }
    };

    expenses.forEach(expense => {
        if (breakdown[expense.category]) {
            breakdown[expense.category].amount +=
                safeParseNumber(expense.amount);
        }
    });

    Object.keys(breakdown).forEach(category => {
        breakdown[category].percentage =
            totalSpent > 0
                ? (breakdown[category].amount / totalSpent) * 100
                : 0;
    });

    return breakdown;
}

/* ========================================
   MASTER ANALYTICS
======================================== */

function generateAnalytics() {
    const budget = getBudget();
    const expenses = getExpenses();

    const totalSpent =
        calculateTotalSpent(expenses);

    const remainingBudget =
        calculateRemainingBudget(
            budget,
            totalSpent
        );

    const usagePercentage =
        calculateUsagePercentage(
            budget,
            totalSpent
        );

    const daysElapsed =
        getDaysElapsed();

    const daysInMonth =
        getDaysInCurrentMonth();

    const remainingDays =
        getRemainingDaysInMonth();

    const categoryBreakdown =
        calculateCategoryBreakdown(
            expenses
        );

    const collectingPattern =
        daysElapsed < 3;

    let velocity = 0;
    let projectedSpend = 0;
    let daysToExhaustion = Infinity;
    let suggestedDailyLimit = 0;
    let riskStatus = {
        level: RISK_LEVELS.SAFE,
        message: ""
    };

    if (!collectingPattern) {
        velocity =
            calculateSpendingVelocity(
                totalSpent,
                daysElapsed
            );

        projectedSpend =
            calculateProjectedSpend(
                velocity,
                daysInMonth
            );

        daysToExhaustion =
            calculateDaysToExhaustion(
                remainingBudget,
                velocity
            );

        suggestedDailyLimit =
            calculateSuggestedDailyLimit(
                remainingBudget,
                remainingDays
            );

        riskStatus =
            calculateRiskStatus(
                projectedSpend,
                budget
            );
    }

    return {
        budget,
        totalSpent,
        remainingBudget,
        usagePercentage,

        velocity,
        projectedSpend,

        daysToExhaustion,
        suggestedDailyLimit,

        riskStatus,

        categoryBreakdown,

        collectingPattern
    };
}

