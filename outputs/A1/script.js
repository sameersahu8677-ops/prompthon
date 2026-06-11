
"use strict";

/* ==========================================================
   SMART BILL SPLITTER & EXPENSE TRACKER
   PART 1 - CORE ARCHITECTURE
   ----------------------------------------------------------
   - DOM Cache
   - StateManager
   - StorageManager
   - NotificationManager
   - LoadingManager
   - Utility Functions
   - App Initialization
========================================================== */

/* ==========================================================
   DOM CACHE
========================================================== */

const DOM = {
    // Core
    body: document.body,

    // Header Actions
    newExpenseBtn: document.getElementById("newExpenseBtn"),

    // Wizard
    wizardState: document.getElementById("wizardState"),

    // Statistics
    totalExpensesStat: document.getElementById("totalExpensesStat"),
    totalAmountStat: document.getElementById("totalAmountStat"),
    averageExpenseStat: document.getElementById("averageExpenseStat"),
    recentExpenseStat: document.getElementById("recentExpenseStat"),
    popularMethodStat: document.getElementById("popularMethodStat"),

    // Expense Form
    expenseForm: document.getElementById("expenseForm"),
    expenseName: document.getElementById("expenseName"),
    billAmount: document.getElementById("billAmount"),
    serviceQuality: document.getElementById("serviceQuality"),

    expenseNameError: document.getElementById("expenseNameError"),
    billAmountError: document.getElementById("billAmountError"),

    tipPreview: document.getElementById("tipPreview"),
    totalPreview: document.getElementById("totalPreview"),

    // Participants
    participantList: document.getElementById("participantList"),
    participantEmptyState: document.getElementById("participantEmptyState"),
    addParticipantBtn: document.getElementById("addParticipantBtn"),

    // Split
    splitConfiguration: document.getElementById("splitConfiguration"),
    splitValidationStatus: document.getElementById("splitValidationStatus"),

    // Review
    reviewContent: document.getElementById("reviewContent"),
    reviewSummaryContainer:
        document.getElementById("reviewSummaryContainer"),
    reviewEmptyState:
        document.getElementById("reviewEmptyState"),

    // Results
    resultsContainer:
        document.getElementById("resultsContainer"),

    participantBreakdownContainer:
        document.getElementById(
            "participantBreakdownContainer"
        ),

    settlementSummaryContainer:
        document.getElementById(
            "settlementSummaryContainer"
        ),

    resultsEmptyState:
        document.getElementById("resultsEmptyState"),

    summaryCards:
        document.getElementById("summaryCards"),

    // History
    historyContainer:
        document.getElementById("historyContainer"),

    historyEmptyState:
        document.getElementById("historyEmptyState"),

    refreshHistoryBtn:
        document.getElementById("refreshHistoryBtn"),

    clearHistoryBtn:
        document.getElementById("clearHistoryBtn"),

    // Wizard Controls
    prevStepBtn:
        document.getElementById("prevStepBtn"),

    nextStepBtn:
        document.getElementById("nextStepBtn"),

    saveResultBtn:
        document.getElementById("saveResultBtn"),

    // Notifications
    notificationContainer:
        document.getElementById(
            "notificationContainer"
        ),

    // Loading
    loadingOverlay:
        document.getElementById("loadingOverlay"),

    // Templates
    participantTemplate:
        document.getElementById(
            "participantTemplate"
        ),

    historyCardTemplate:
        document.getElementById(
            "historyCardTemplate"
        ),

    resultCardTemplate:
        document.getElementById(
            "resultCardTemplate"
        ),

    notificationTemplate:
        document.getElementById(
            "notificationTemplate"
        )
};

/* ==========================================================
   CONSTANTS
========================================================== */

const APP_CONFIG = {
    STORAGE_KEY:
        "smart_bill_splitter_history",

    NOTIFICATION_DURATION:
        3500,

    CURRENCY:
        "INR",

    DEFAULT_SPLIT_METHOD:
        "equal",

    DEFAULT_STEP:
        1
};

/* ==========================================================
   UTILITY FUNCTIONS
========================================================== */

const Utils = (() => {

    const generateId = () => {
        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );
    };

    const safeParseJSON = (
        value,
        fallback = null
    ) => {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    };

    const formatCurrency = (
        amount
    ) => {

        const value =
            Number(amount) || 0;

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency:
                    APP_CONFIG.CURRENCY,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(value);
    };

    const debounce = (
        callback,
        delay = 300
    ) => {

        let timer;

        return (...args) => {

            clearTimeout(timer);

            timer = setTimeout(
                () =>
                    callback(...args),
                delay
            );
        };
    };

    const clamp = (
        value,
        min,
        max
    ) =>
        Math.min(
            Math.max(value, min),
            max
        );

    const isEmpty = (
        value
    ) =>
        value === null ||
        value === undefined ||
        value
            .toString()
            .trim() === "";

    const deepClone = (
        object
    ) =>
        structuredClone(object);

    return {
        generateId,
        safeParseJSON,
        formatCurrency,
        debounce,
        clamp,
        isEmpty,
        deepClone
    };

})();

/* ==========================================================
   STATE MANAGER
========================================================== */

const StateManager = (() => {

    const state = {

        currentStep:
            APP_CONFIG.DEFAULT_STEP,

        currentExpense: {
            expenseName: "",
            baseAmount: 0,
            tipPercentage: 15,
            tipAmount: 0,
            finalAmount: 0,
            createdAt: null
        },

        participants: [],

        splitMethod:
            APP_CONFIG.DEFAULT_SPLIT_METHOD,

        tipInfo: {
            percentage: 15,
            amount: 0
        },

        results: [],

        history: []
    };

    const getState = () =>
        state;

    const updateState = (
        partialState
    ) => {

        Object.assign(
            state,
            partialState
        );

        return state;
    };

    const setCurrentStep = (
        step
    ) => {

        state.currentStep = step;

        if (
            DOM.wizardState
        ) {
            DOM.wizardState.dataset.currentStep =
                step;
        }
    };

    const resetCurrentExpense =
        () => {

            state.currentExpense = {
                expenseName: "",
                baseAmount: 0,
                tipPercentage: 15,
                tipAmount: 0,
                finalAmount: 0,
                createdAt: null
            };

            state.participants =
                [];

            state.results = [];

            state.splitMethod =
                "equal";

            state.tipInfo = {
                percentage: 15,
                amount: 0
            };

            setCurrentStep(1);
        };

    return {
        getState,
        updateState,
        setCurrentStep,
        resetCurrentExpense
    };

})();

/* ==========================================================
   STORAGE MANAGER
========================================================== */

const StorageManager = (() => {

    const saveHistory = (
        history
    ) => {

        try {

            localStorage.setItem(
                APP_CONFIG.STORAGE_KEY,
                JSON.stringify(
                    history
                )
            );

            return true;

        } catch (
            error
        ) {

            console.error(
                "Failed to save history",
                error
            );

            return false;
        }
    };

    const loadHistory =
        () => {

            try {

                const data =
                    localStorage.getItem(
                        APP_CONFIG.STORAGE_KEY
                    );

                if (
                    !data
                ) {
                    return [];
                }

                return Utils.safeParseJSON(
                    data,
                    []
                );

            } catch (
                error
            ) {

                console.error(
                    "Failed to load history",
                    error
                );

                return [];
            }
        };

    const clearHistory =
        () => {

            try {

                localStorage.removeItem(
                    APP_CONFIG.STORAGE_KEY
                );

                return true;

            } catch (
                error
            ) {

                console.error(
                    error
                );

                return false;
            }
        };

    return {
        saveHistory,
        loadHistory,
        clearHistory
    };

})();

/* ==========================================================
   NOTIFICATION MANAGER
========================================================== */

const NotificationManager =
(() => {

    const createNotification =
        (
            type = "info",
            message = ""
        ) => {

            const notification =
                document.createElement(
                    "div"
                );

            notification.className =
                `notification ${ type } `;

            notification.innerHTML =
                `
    < strong >
    ${ type.toUpperCase() }
                </strong >
    <div>${message}</div>
`;

            return notification;
        };

    const show = (
        type,
        message
    ) => {

        if (
            !DOM.notificationContainer
        ) {
            return;
        }

        const notification =
            createNotification(
                type,
                message
            );

        DOM.notificationContainer.appendChild(
            notification
        );

        setTimeout(
            () => {

                notification.style.animation =
                    "toastSlideOut 0.3s ease forwards";

                setTimeout(
                    () => {

                        notification.remove();

                    },
                    300
                );

            },
            APP_CONFIG.NOTIFICATION_DURATION
        );
    };

    return {

        success:
            message =>
                show(
                    "success",
                    message
                ),

        error:
            message =>
                show(
                    "error",
                    message
                ),

        warning:
            message =>
                show(
                    "warning",
                    message
                ),

        info:
            message =>
                show(
                    "info",
                    message
                )
    };

})();

/* ==========================================================
   LOADING MANAGER
========================================================== */

const LoadingManager =
(() => {

    const showLoading =
        () => {

            if (
                DOM.loadingOverlay
            ) {

                DOM.loadingOverlay.classList.remove(
                    "hidden"
                );
            }
        };

    const hideLoading =
        () => {

            if (
                DOM.loadingOverlay
            ) {

                DOM.loadingOverlay.classList.add(
                    "hidden"
                );
            }
        };

    return {
        showLoading,
        hideLoading
    };

})();

/* ==========================================================
   APPLICATION INITIALIZATION
========================================================== */

const App = (() => {

    const loadInitialState =
        () => {

            const history =
                StorageManager.loadHistory();

            StateManager.updateState(
                {
                    history
                }
            );
        };

    const bindInitialEvents =
        () => {

            window.addEventListener(
                "error",
                (
                    event
                ) => {

                    console.error(
                        event.error
                    );

                    NotificationManager.error(
                        "Unexpected error occurred."
                    );
                }
            );
        };

    const initialize =
        () => {

            try {

                LoadingManager.showLoading();

                loadInitialState();

                bindInitialEvents();

                console.log(
                    "Smart Bill Splitter Initialized"
                );

            } catch (
                error
            ) {

                console.error(
                    error
                );

                NotificationManager.error(
                    "Failed to initialize application."
                );

            } finally {

                LoadingManager.hideLoading();
            }
        };

    return {
        initialize
    };

})();

/* ==========================================================
   BOOTSTRAP
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.initialize();

    }
);

