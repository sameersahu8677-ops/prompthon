
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


/* ==========================================================
   PART 2 - BUSINESS LOGIC
   ----------------------------------------------------------
   - ExpenseManager
   - ParticipantManager
   - TipEngine
   - RoundingEngine
   - SplitEngine
   - ValidationEngine

   NOTE:
   Depends on:
   - StateManager
   - Utils
========================================================== */

/* ==========================================================
   EXPENSE MANAGER
========================================================== */

const ExpenseManager = (() => {

    const createExpense = ({
        expenseName,
        baseAmount,
        tipPercentage
    }) => {

        const tipAmount =
            TipEngine.calculateTip(
                baseAmount,
                tipPercentage
            );

        const finalAmount =
            TipEngine.calculateFinalAmount(
                baseAmount,
                tipPercentage
            );

        const expense = {
            expenseName:
                expenseName.trim(),

            baseAmount:
                Number(baseAmount),

            tipPercentage:
                Number(tipPercentage),

            tipAmount,

            finalAmount,

            createdAt:
                new Date().toISOString()
        };

        StateManager.updateState({
            currentExpense:
                expense
        });

        return expense;
    };

    const updateExpense =
        (updates = {}) => {

            const state =
                StateManager.getState();

            const updatedExpense = {
                ...state.currentExpense,
                ...updates
            };

            StateManager.updateState({
                currentExpense:
                    updatedExpense
            });

            return updatedExpense;
        };

    const resetExpense =
        () => {

            StateManager.resetCurrentExpense();
        };

    const buildExpenseRecord =
        () => {

            const state =
                StateManager.getState();

            return {
                id:
                    Utils.generateId(),

                ...state.currentExpense,

                splitMethod:
                    state.splitMethod,

                participants:
                    Utils.deepClone(
                        state.participants
                    ),

                shares:
                    Utils.deepClone(
                        state.results
                    )
            };
        };

    return {
        createExpense,
        updateExpense,
        resetExpense,
        buildExpenseRecord
    };

})();

/* ==========================================================
   PARTICIPANT MANAGER
========================================================== */

const ParticipantManager =
(() => {

    const addParticipant =
        (name) => {

            const cleanName =
                name.trim();

            const participant = {
                id:
                    Utils.generateId(),

                name:
                    cleanName
            };

            const state =
                StateManager.getState();

            StateManager.updateState({
                participants: [
                    ...state.participants,
                    participant
                ]
            });

            return participant;
        };

    const updateParticipant =
        (
            participantId,
            newName
        ) => {

            const state =
                StateManager.getState();

            const participants =
                state.participants.map(
                    participant =>
                        participant.id ===
                        participantId
                            ? {
                                  ...participant,
                                  name:
                                      newName.trim()
                              }
                            : participant
                );

            StateManager.updateState({
                participants
            });

            return participants;
        };

    const removeParticipant =
        (
            participantId
        ) => {

            const state =
                StateManager.getState();

            const participants =
                state.participants.filter(
                    participant =>
                        participant.id !==
                        participantId
                );

            StateManager.updateState({
                participants
            });

            return participants;
        };

    return {
        addParticipant,
        updateParticipant,
        removeParticipant
    };

})();

/* ==========================================================
   TIP ENGINE
========================================================== */

const TipEngine = (() => {

    const calculateTip =
        (
            baseAmount,
            percentage
        ) => {

            const basePaise =
                RoundingEngine.toPaise(
                    baseAmount
                );

            const tipPaise =
                Math.round(
                    (
                        basePaise *
                        Number(
                            percentage
                        )
                    ) / 100
                );

            return (
                RoundingEngine.fromPaise(
                    tipPaise
                )
            );
        };

    const calculateFinalAmount =
        (
            baseAmount,
            percentage
        ) => {

            const basePaise =
                RoundingEngine.toPaise(
                    baseAmount
                );

            const tipPaise =
                Math.round(
                    (
                        basePaise *
                        Number(
                            percentage
                        )
                    ) / 100
                );

            return (
                RoundingEngine.fromPaise(
                    basePaise +
                        tipPaise
                )
            );
        };

    return {
        calculateTip,
        calculateFinalAmount
    };

})();

/* ==========================================================
   ROUNDING ENGINE
========================================================== */

const RoundingEngine =
(() => {

    const toPaise =
        (amount) => {

            return Math.round(
                Number(amount) * 100
            );
        };

    const fromPaise =
        (paise) => {

            return Number(
                (paise / 100).toFixed(
                    2
                )
            );
        };

    const distributeRemainder =
        (
            shares,
            remainder
        ) => {

            for (
                let i = 0;
                i < remainder;
                i++
            ) {
                shares[
                    i %
                        shares.length
                ] += 1;
            }

            return shares;
        };

    const splitEvenly =
        (
            totalAmount,
            participantCount
        ) => {

            const totalPaise =
                toPaise(
                    totalAmount
                );

            const baseShare =
                Math.floor(
                    totalPaise /
                        participantCount
                );

            const remainder =
                totalPaise %
                participantCount;

            const shares =
                Array(
                    participantCount
                ).fill(baseShare);

            distributeRemainder(
                shares,
                remainder
            );

            return shares.map(
                fromPaise
            );
        };

    const splitByPercentage =
        (
            totalAmount,
            percentages
        ) => {

            const totalPaise =
                toPaise(
                    totalAmount
                );

            const shares =
                percentages.map(
                    percentage =>
                        Math.floor(
                            (
                                totalPaise *
                                percentage
                            ) / 100
                        )
                );

            const allocated =
                shares.reduce(
                    (
                        total,
                        value
                    ) =>
                        total +
                        value,
                    0
                );

            const remainder =
                totalPaise -
                allocated;

            distributeRemainder(
                shares,
                remainder
            );

            return shares.map(
                fromPaise
            );
        };

    const splitByCustomAmounts =
        (
            customAmounts
        ) => {

            return customAmounts.map(
                amount =>
                    fromPaise(
                        toPaise(
                            amount
                        )
                    )
            );
        };

    return {
        toPaise,
        fromPaise,
        splitEvenly,
        splitByPercentage,
        splitByCustomAmounts
    };

})();

/* ==========================================================
   SPLIT ENGINE
========================================================== */

const SplitEngine = (() => {

    const equalSplit =
        (
            finalAmount,
            participants
        ) => {

            const shares =
                RoundingEngine.splitEvenly(
                    finalAmount,
                    participants.length
                );

            return participants.map(
                (
                    participant,
                    index
                ) => ({
                    participantId:
                        participant.id,

                    participantName:
                        participant.name,

                    percentage:
                        Number(
                            (
                                100 /
                                participants.length
                            ).toFixed(
                                2
                            )
                        ),

                    amount:
                        shares[
                            index
                        ]
                })
            );
        };

    const percentageSplit =
        (
            finalAmount,
            participants,
            percentages
        ) => {

            const shares =
                RoundingEngine.splitByPercentage(
                    finalAmount,
                    percentages
                );

            return participants.map(
                (
                    participant,
                    index
                ) => ({
                    participantId:
                        participant.id,

                    participantName:
                        participant.name,

                    percentage:
                        Number(
                            percentages[
                                index
                            ]
                        ),

                    amount:
                        shares[
                            index
                        ]
                })
            );
        };

    const customSplit =
        (
            participants,
            customAmounts
        ) => {

            const shares =
                RoundingEngine.splitByCustomAmounts(
                    customAmounts
                );

            const total =
                shares.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum +
                        value,
                    0
                );

            return participants.map(
                (
                    participant,
                    index
                ) => ({
                    participantId:
                        participant.id,

                    participantName:
                        participant.name,

                    percentage:
                        total === 0
                            ? 0
                            : Number(
                                  (
                                      (shares[
                                          index
                                      ] /
                                          total) *
                                      100
                                  ).toFixed(
                                      2
                                  )
                              ),

                    amount:
                        shares[
                            index
                        ]
                })
            );
        };

    return {
        equalSplit,
        percentageSplit,
        customSplit
    };

})();

/* ==========================================================
   VALIDATION ENGINE
========================================================== */

const ValidationEngine =
(() => {

    const validateExpense =
        (
            expenseName,
            billAmount
        ) => {

            const errors =
                {};

            if (
                Utils.isEmpty(
                    expenseName
                )
            ) {

                errors.expenseName =
                    "Expense name is required.";
            }

            if (
                Utils.isEmpty(
                    billAmount
                )
            ) {

                errors.billAmount =
                    "Bill amount is required.";
            } else {

                const amount =
                    Number(
                        billAmount
                    );

                if (
                    Number.isNaN(
                        amount
                    )
                ) {

                    errors.billAmount =
                        "Invalid bill amount.";
                }

                if (
                    amount <= 0
                ) {

                    errors.billAmount =
                        "Bill amount must be greater than zero.";
                }
            }

            return {
                valid:
                    Object.keys(
                        errors
                    ).length ===
                    0,

                errors
            };
        };

    const validateParticipants =
        (
            participants
        ) => {

            const errors =
                [];

            if (
                !participants ||
                participants.length ===
                    0
            ) {

                errors.push(
                    "At least one participant is required."
                );
            }

            const names =
                participants.map(
                    participant =>
                        participant.name
                            .trim()
                            .toLowerCase()
                );

            const duplicates =
                names.filter(
                    (
                        name,
                        index
                    ) =>
                        names.indexOf(
                            name
                        ) !== index
                );

            if (
                duplicates.length
            ) {

                errors.push(
                    "Duplicate participant names found."
                );
            }

            if (
                names.some(
                    name =>
                        !name
                )
            ) {

                errors.push(
                    "Participant names cannot be empty."
                );
            }

            return {
                valid:
                    errors.length ===
                    0,

                errors
            };
        };

    const validatePercentages =
        (
            percentages
        ) => {

            const total =
                percentages.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum +
                        Number(
                            value
                        ),
                    0
                );

            return {
                valid:
                    Math.abs(
                        total -
                            100
                    ) < 0.0001,

                total
            };
        };

    const validateCustomAmounts =
        (
            customAmounts,
            finalAmount
        ) => {

            const total =
                customAmounts.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum +
                        Number(
                            value
                        ),
                    0
                );

            const valid =
                RoundingEngine.toPaise(
                    total
                ) ===
                RoundingEngine.toPaise(
                    finalAmount
                );

            return {
                valid,
                total
            };
        };

    return {
        validateExpense,
        validateParticipants,
        validatePercentages,
        validateCustomAmounts
    };

})();

/* ==========================================================
   PART 3A - UI FOUNDATION
   ----------------------------------------------------------
   - UIManager
   - Dashboard Rendering
   - Participant Rendering
   - History Rendering
========================================================== */

const UIManager = (() => {

    /* ======================================================
       HELPERS
    ====================================================== */

    const clearContainer = (container) => {
        if (!container) return;
        container.innerHTML = "";
    };

    const showEmptyState = (element) => {
        if (!element) return;
        element.style.display = "";
    };

    const hideEmptyState = (element) => {
        if (!element) return;
        element.style.display = "none";
    };

    /* ======================================================
       DASHBOARD RENDERING
    ====================================================== */

    const renderDashboard = () => {

        const state = StateManager.getState();
        const history = state.history || [];

        const totalExpenses = history.length;

        const totalAmountProcessed = history.reduce(
            (sum, expense) =>
                sum + Number(expense.finalAmount || 0),
            0
        );

        const averageExpense =
            totalExpenses > 0
                ? totalAmountProcessed / totalExpenses
                : 0;

        const mostRecentExpense =
            history.length > 0
                ? history[history.length - 1]
                : null;

        const splitMethodCount = {};

        history.forEach(expense => {

            const method =
                expense.splitMethod || "unknown";

            splitMethodCount[method] =
                (splitMethodCount[method] || 0) + 1;
        });

        let mostUsedMethod = "—";
        let highestCount = 0;

        Object.entries(splitMethodCount)
            .forEach(([method, count]) => {

                if (count > highestCount) {

                    highestCount = count;
                    mostUsedMethod = method;
                }
            });

        if (DOM.totalExpensesStat) {
            DOM.totalExpensesStat.textContent =
                totalExpenses;
        }

        if (DOM.totalAmountStat) {
            DOM.totalAmountStat.textContent =
                Utils.formatCurrency(
                    totalAmountProcessed
                );
        }

        if (DOM.averageExpenseStat) {
            DOM.averageExpenseStat.textContent =
                Utils.formatCurrency(
                    averageExpense
                );
        }

        if (DOM.recentExpenseStat) {

            DOM.recentExpenseStat.textContent =
                mostRecentExpense
                    ? mostRecentExpense.expenseName
                    : "None";
        }

        if (DOM.popularMethodStat) {

            DOM.popularMethodStat.textContent =
                mostUsedMethod;
        }
    };

    /* ======================================================
       PARTICIPANT RENDERING
    ====================================================== */

    const createParticipantCard = (
        participant
    ) => {

        const card =
            document.createElement("div");

        card.className =
            "participant-card";

        card.dataset.participantId =
            participant.id;

        card.innerHTML = `
            <div class="participant-info">
                <strong>
                    ${participant.name}
                </strong>
            </div>

            <div class="participant-actions">

                <button
                    type="button"
                    class="secondary-btn participant-edit-btn"
                    data-participant-id="${participant.id}"
                    data-action="edit-participant">

                    Edit
                </button>

                <button
                    type="button"
                    class="danger-btn participant-delete-btn"
                    data-participant-id="${participant.id}"
                    data-action="delete-participant">

                    Delete
                </button>

            </div>
        `;

        return card;
    };

    const renderParticipants = () => {

        if (!DOM.participantList) {
            return;
        }

        const participants =
            StateManager.getState()
                .participants;

        clearContainer(
            DOM.participantList
        );

        if (
            !participants ||
            participants.length === 0
        ) {

            if (
                DOM.participantEmptyState
            ) {

                DOM.participantList.appendChild(
                    DOM.participantEmptyState
                );

                showEmptyState(
                    DOM.participantEmptyState
                );
            }

            return;
        }

        hideEmptyState(
            DOM.participantEmptyState
        );

        participants.forEach(
            participant => {

                DOM.participantList.appendChild(
                    createParticipantCard(
                        participant
                    )
                );
            }
        );
    };

    /* ======================================================
       HISTORY RENDERING
    ====================================================== */

    const createHistoryCard = (
        expense
    ) => {

        const card =
            document.createElement("div");

        card.className =
            "history-card";

        card.dataset.expenseId =
            expense.id;

        const createdDate =
            expense.createdAt
                ? new Date(
                      expense.createdAt
                  ).toLocaleString()
                : "Unknown";

        card.innerHTML = `
            <div class="history-card-header">

                <div>

                    <h4>
                        ${expense.expenseName}
                    </h4>

                    <p>
                        ${createdDate}
                    </p>

                </div>

                <strong>
                    ${Utils.formatCurrency(
                        expense.finalAmount || 0
                    )}
                </strong>

            </div>

            <div class="history-card-body">

                <p>
                    Split Method:
                    <strong>
                        ${expense.splitMethod || "N/A"}
                    </strong>
                </p>

                <p>
                    Participants:
                    <strong>
                        ${
                            expense.participants
                                ? expense.participants.length
                                : 0
                        }
                    </strong>
                </p>

            </div>

            <div class="history-actions">

                <button
                    type="button"
                    class="secondary-btn"
                    data-action="view-history"
                    data-expense-id="${expense.id}">

                    View
                </button>

                <button
                    type="button"
                    class="danger-btn"
                    data-action="delete-history"
                    data-expense-id="${expense.id}">

                    Delete
                </button>

            </div>
        `;

        return card;
    };

    const renderHistory = () => {

        if (!DOM.historyContainer) {
            return;
        }

        const history =
            StateManager.getState()
                .history;

        clearContainer(
            DOM.historyContainer
        );

        if (
            !history ||
            history.length === 0
        ) {

            if (
                DOM.historyEmptyState
            ) {

                DOM.historyContainer.appendChild(
                    DOM.historyEmptyState
                );

                showEmptyState(
                    DOM.historyEmptyState
                );
            }

            return;
        }

        hideEmptyState(
            DOM.historyEmptyState
        );

        const sortedHistory =
            [...history].sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ) -
                    new Date(
                        a.createdAt
                    )
            );

        sortedHistory.forEach(
            expense => {

                DOM.historyContainer.appendChild(
                    createHistoryCard(
                        expense
                    )
                );
            }
        );
    };

    /* ======================================================
       FULL REFRESH
    ====================================================== */

    const refreshAll = () => {

        renderDashboard();
        renderParticipants();
        renderHistory();
    };

    /* ======================================================
       PUBLIC API
    ====================================================== */

    return {

        clearContainer,

        showEmptyState,

        hideEmptyState,

        renderDashboard,

        renderParticipants,

        renderHistory,

        refreshAll
    };

})();

/* ==========================================================
   PART 3B - SPLIT CONFIGURATION + REVIEW RENDERING
   ----------------------------------------------------------
   Adds methods onto existing UIManager
========================================================== */

Object.assign(UIManager, (() => {

    /* ======================================================
       VALIDATION STATUS
    ====================================================== */

    const renderValidationStatus = (
        message = "",
        type = "warning"
    ) => {

        if (!DOM.splitValidationStatus) {
            return;
        }

        DOM.splitValidationStatus.className =
            `validation-status ${type}`;

        DOM.splitValidationStatus.textContent =
            message;

        if (!message) {
            DOM.splitValidationStatus.style.display =
                "none";
            return;
        }

        DOM.splitValidationStatus.style.display =
            "block";
    };

    /* ======================================================
       EQUAL SPLIT PREVIEW
    ====================================================== */

    const renderEqualSplit = (
        participants,
        finalAmount
    ) => {

        const participantCount =
            participants.length;

        const shares =
            participantCount > 0
                ? RoundingEngine.splitEvenly(
                      finalAmount,
                      participantCount
                  )
                : [];

        const equalShare =
            shares.length > 0
                ? shares[0]
                : 0;

        return `
            <div class="card">

                <h3>
                    Equal Split
                </h3>

                <p>
                    Participants:
                    <strong>
                        ${participantCount}
                    </strong>
                </p>

                <p>
                    Approx Share:
                    <strong>
                        ${Utils.formatCurrency(
                            equalShare
                        )}
                    </strong>
                </p>

                <p>
                    Final Amount:
                    <strong>
                        ${Utils.formatCurrency(
                            finalAmount
                        )}
                    </strong>
                </p>

            </div>
        `;
    };

    /* ======================================================
       PERCENTAGE SPLIT UI
    ====================================================== */

    const renderPercentageSplit = (
        participants
    ) => {

        return `
            <div class="card">

                <h3>
                    Percentage Allocation
                </h3>

                <p>
                    Total must equal
                    <strong>100%</strong>
                </p>

                ${participants
                    .map(
                        participant => `
                        <div class="form-group">

                            <label>
                                ${participant.name}
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"

                                data-percentage-input

                                data-participant-id="${participant.id}"

                                placeholder="Enter percentage"
                            />

                        </div>
                    `
                    )
                    .join("")}

            </div>
        `;
    };

    /* ======================================================
       CUSTOM SPLIT UI
    ====================================================== */

    const renderCustomSplit = (
        participants
    ) => {

        return `
            <div class="card">

                <h3>
                    Custom Amount Allocation
                </h3>

                <p>
                    Assigned total must match
                    final payable amount.
                </p>

                ${participants
                    .map(
                        participant => `
                        <div class="form-group">

                            <label>
                                ${participant.name}
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"

                                data-custom-amount-input

                                data-participant-id="${participant.id}"

                                placeholder="Enter amount"
                            />

                        </div>
                    `
                    )
                    .join("")}

            </div>
        `;
    };

    /* ======================================================
       SPLIT CONFIGURATION
    ====================================================== */

    const renderSplitConfiguration =
        () => {

            if (
                !DOM.splitConfiguration
            ) {
                return;
            }

            const state =
                StateManager.getState();

            const participants =
                state.participants || [];

            const finalAmount =
                Number(
                    state.currentExpense
                        ?.finalAmount || 0
                );

            UIManager.clearContainer(
                DOM.splitConfiguration
            );

            if (
                participants.length === 0
            ) {

                DOM.splitConfiguration.innerHTML =
                    `
                    <div class="empty-state">
                        <h4>
                            No Participants
                        </h4>
                        <p>
                            Add participants
                            before configuring
                            split methods.
                        </p>
                    </div>
                `;

                return;
            }

            let html = "";

            switch (
                state.splitMethod
            ) {

                case "equal":

                    html =
                        renderEqualSplit(
                            participants,
                            finalAmount
                        );

                    break;

                case "percentage":

                    html =
                        renderPercentageSplit(
                            participants
                        );

                    break;

                case "custom":

                    html =
                        renderCustomSplit(
                            participants
                        );

                    break;

                default:

                    html =
                        renderEqualSplit(
                            participants,
                            finalAmount
                        );
            }

            DOM.splitConfiguration.innerHTML =
                html;
        };

    /* ======================================================
       REVIEW RENDERING
    ====================================================== */

    const renderReview =
        () => {

            if (
                !DOM.reviewSummaryContainer
            ) {
                return;
            }

            const state =
                StateManager.getState();

            const expense =
                state.currentExpense;

            const participants =
                state.participants || [];

            if (
                !expense ||
                !expense.expenseName
            ) {

                if (
                    DOM.reviewEmptyState
                ) {

                    UIManager.showEmptyState(
                        DOM.reviewEmptyState
                    );
                }

                UIManager.clearContainer(
                    DOM.reviewSummaryContainer
                );

                return;
            }

            if (
                DOM.reviewEmptyState
            ) {

                UIManager.hideEmptyState(
                    DOM.reviewEmptyState
                );
            }

            const participantList =
                participants.length
                    ? `
                    <ul>
                        ${participants
                            .map(
                                participant => `
                                <li>
                                    ${participant.name}
                                </li>
                            `
                            )
                            .join("")}
                    </ul>
                `
                    : "<p>No participants added.</p>";

            DOM.reviewSummaryContainer.innerHTML =
                `
                <div class="card">

                    <h3>
                        Expense Review
                    </h3>

                    <div class="summary-grid">

                        <div>
                            <strong>
                                Expense Name
                            </strong>
                            <p>
                                ${expense.expenseName}
                            </p>
                        </div>

                        <div>
                            <strong>
                                Bill Amount
                            </strong>
                            <p>
                                ${Utils.formatCurrency(
                                    expense.baseAmount
                                )}
                            </p>
                        </div>

                        <div>
                            <strong>
                                Tip %
                            </strong>
                            <p>
                                ${expense.tipPercentage}%
                            </p>
                        </div>

                        <div>
                            <strong>
                                Tip Amount
                            </strong>
                            <p>
                                ${Utils.formatCurrency(
                                    expense.tipAmount
                                )}
                            </p>
                        </div>

                        <div>
                            <strong>
                                Final Amount
                            </strong>
                            <p>
                                ${Utils.formatCurrency(
                                    expense.finalAmount
                                )}
                            </p>
                        </div>

                        <div>
                            <strong>
                                Split Method
                            </strong>
                            <p>
                                ${state.splitMethod}
                            </p>
                        </div>

                    </div>

                    <div
                        style="
                        margin-top:1.25rem;
                        ">

                        <strong>
                            Participants
                        </strong>

                        ${participantList}

                    </div>

                </div>
            `;
        };

    /* ======================================================
       PUBLIC METHODS
    ====================================================== */

    return {

        renderSplitConfiguration,

        renderReview,

        renderValidationStatus

    };

})());