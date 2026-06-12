/* ==================================================
CONSTANTS
================================================== */

const STORAGE_KEY = "flash-study-buddy";

const TOAST_DURATION = 3000;

const VIEW_IDS = [
    "dashboard-view",
    "deck-view",
    "study-view",
    "summary-view",
    "analytics-view"
];

/* ==================================================
CENTRAL STATE
================================================== */

const state = {
    decks: [],
    activeDeckId: null,
    activeSession: null,
    analytics: {},
    settings: {}
};

/* ==================================================
DOM CACHE
================================================== */

const DOM = {
    views: {
        dashboard: document.getElementById("dashboard-view"),
        deck: document.getElementById("deck-view"),
        study: document.getElementById("study-view"),
        summary: document.getElementById("summary-view"),
        analytics: document.getElementById("analytics-view")
    },


    navigation: {
        dashboardBtn: document.getElementById("nav-dashboard-btn"),
        analyticsBtn: document.getElementById("nav-analytics-btn")
    },

    modals: {
        createDeck: document.getElementById("create-deck-modal"),
        addCard: document.getElementById("add-card-modal"),
        bulkAdd: document.getElementById("bulk-add-modal")
    },

    forms: {
        createDeck: document.getElementById("create-deck-form"),
        addCard: document.getElementById("add-card-form"),
        bulkAdd: document.getElementById("bulk-add-form")
    },

    buttons: {
        createDeck: document.getElementById("create-deck-btn"),
        saveDeck: document.getElementById("save-deck-btn"),
        cancelCreateDeck: document.getElementById("cancel-create-deck-btn"),

        addCard: document.getElementById("add-card-btn"),
        saveCard: document.getElementById("save-card-btn"),
        cancelAddCard: document.getElementById("cancel-add-card-btn"),

        bulkAdd: document.getElementById("bulk-add-cards-btn"),
        importCards: document.getElementById("import-cards-btn"),
        cancelBulkAdd: document.getElementById("cancel-bulk-add-btn"),

        startQuiz: document.getElementById("start-quiz-btn"),

        revealAnswer: document.getElementById("reveal-answer-btn"),
        gotItRight: document.getElementById("got-it-right-btn"),
        gotItWrong: document.getElementById("got-it-wrong-btn"),

        studyAgain: document.getElementById("study-again-btn"),
        returnToDeck: document.getElementById("return-to-deck-btn")
    },

    inputs: {
        deckName: document.getElementById("deck-name-input"),

        question: document.getElementById("card-question-input"),
        answer: document.getElementById("card-answer-input"),

        bulkInput: document.getElementById("bulk-card-input")
    },

    containers: {
        deckGrid: document.getElementById("deck-grid-container"),
        cardList: document.getElementById("card-list-container"),

        sessionProgress: document.getElementById("session-progress-container"),

        flashcard: document.getElementById("flashcard-container"),

        leitnerFeedback: document.getElementById("leitner-feedback-container"),

        analyticsOverview: document.getElementById("analytics-overview-container"),

        boxDistribution: document.getElementById("box-distribution-container")
    },

    statistics: {
        totalDecks: document.getElementById("total-decks-value"),
        totalCards: document.getElementById("total-cards-value"),
        totalMasteredCards: document.getElementById("total-mastered-cards-value"),

        deckTotalCards: document.getElementById("deck-total-cards-value"),
        deckMasteredCards: document.getElementById("deck-mastered-cards-value"),
        deckAccuracy: document.getElementById("deck-accuracy-value"),

        cardsRemaining: document.getElementById("cards-remaining-value"),
        sessionScore: document.getElementById("session-score-value"),
        currentBox: document.getElementById("current-box-value"),
        currentStatus: document.getElementById("current-status-value"),

        summaryReviewed: document.getElementById("summary-reviewed-value"),
        summaryCorrect: document.getElementById("summary-correct-value"),
        summaryWrong: document.getElementById("summary-wrong-value"),
        summaryAccuracy: document.getElementById("summary-accuracy-value"),
        summaryMastered: document.getElementById("summary-mastered-value"),

        analyticsReviews: document.getElementById("analytics-total-reviews-value"),
        analyticsAccuracy: document.getElementById("analytics-accuracy-value"),
        analyticsMastered: document.getElementById("analytics-mastered-cards-value")
    },

    study: {
        activeDeckName: document.getElementById("active-deck-name"),

        questionDisplay: document.getElementById("question-display"),
        answerDisplay: document.getElementById("answer-display"),

        cardMovementMessage: document.getElementById("card-movement-message"),
        schedulingMessage: document.getElementById("scheduling-message")
    },

    analytics: {
        box1: document.getElementById("box-1-count"),
        box2: document.getElementById("box-2-count"),
        box3: document.getElementById("box-3-count"),
        box4: document.getElementById("box-4-count"),
        box5: document.getElementById("box-5-count")
    }


};

/* ==================================================
UTILITY FUNCTIONS
================================================== */

function generateId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getCurrentTimestamp() {
    return new Date().toISOString();
}

function getActiveDeck() {
    return state.decks.find(
        deck => deck.id === state.activeDeckId
    ) || null;
}

function escapeHtml(value) {
    const div = document.createElement("div");


    div.textContent = value;

    return div.innerHTML;


}

/* ==================================================
STORAGE MANAGER
================================================== */

const StorageManager = {


    load() {
        try {
            const rawData = localStorage.getItem(STORAGE_KEY);

            if (!rawData) {
                return;
            }

            const parsedData = JSON.parse(rawData);

            if (!parsedData || typeof parsedData !== "object") {
                throw new Error("Invalid storage format");
            }

            state.decks = Array.isArray(parsedData.decks)
                ? parsedData.decks
                : [];

            state.activeDeckId =
                parsedData.activeDeckId ?? null;

            state.activeSession =
                parsedData.activeSession ?? null;

            state.analytics =
                parsedData.analytics ?? {};

            state.settings =
                parsedData.settings ?? {};

        } catch (error) {

            console.error(
                "Storage load failed:",
                error
            );

            localStorage.removeItem(STORAGE_KEY);

            showToast(
                "Stored data was corrupted and has been reset.",
                "warning"
            );
        }
    },

    save() {
        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.error(
                "Storage save failed:",
                error
            );

            showToast(
                "Failed to save data.",
                "error"
            );
        }
    },

    reset() {

        localStorage.removeItem(STORAGE_KEY);

        state.decks = [];
        state.activeDeckId = null;
        state.activeSession = null;
        state.analytics = {};
        state.settings = {};
    }


};

/* ==================================================
VALIDATION MANAGER
================================================== */

const ValidationManager = {


    validateDeckName(name) {

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return {
                valid: false,
                message: "Deck name is required."
            };
        }

        return {
            valid: true,
            message: ""
        };
    },

    validateCard(question, answer) {

        if (
            typeof question !== "string" ||
            !question.trim()
        ) {
            return {
                valid: false,
                message: "Question is required."
            };
        }

        if (
            typeof answer !== "string" ||
            !answer.trim()
        ) {
            return {
                valid: false,
                message: "Answer is required."
            };
        }

        return {
            valid: true,
            message: ""
        };
    },

    validateBulkImportLine(line) {

        if (
            typeof line !== "string" ||
            !line.trim()
        ) {
            return {
                valid: false,
                message: "Empty line."
            };
        }

        const parts = line.split("|");

        if (parts.length !== 2) {
            return {
                valid: false,
                message: "Invalid format."
            };
        }

        const question = parts[0].trim();
        const answer = parts[1].trim();

        if (!question || !answer) {
            return {
                valid: false,
                message: "Question or answer missing."
            };
        }

        return {
            valid: true,
            message: ""
        };
    }


};

/* ==================================================
TOAST MANAGER
================================================== */

function showToast(
    message,
    type = "info"
) {


    let toastContainer =
        document.querySelector(".toast-container");

    if (!toastContainer) {

        toastContainer =
            document.createElement("div");

        toastContainer.className =
            "toast-container";

        document.body.appendChild(
            toastContainer
        );
    }

    const toast =
        document.createElement("div");

    toast.classList.add("toast");

    const allowedTypes = [
        "success",
        "error",
        "warning",
        "info"
    ];

    const safeType =
        allowedTypes.includes(type)
            ? type
            : "info";

    toast.classList.add(
        `${safeType} -toast`
    );

    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.remove();

        if (
            toastContainer &&
            !toastContainer.children.length
        ) {
            toastContainer.remove();
        }

    }, TOAST_DURATION);


}

/* ==================================================
VIEW MANAGER
================================================== */

const ViewManager = {


    hideAllViews() {

        Object.values(DOM.views)
            .forEach(view => {

                view.classList.remove(
                    "active-view"
                );

                view.classList.add(
                    "hidden"
                );
            });

        DOM.navigation.dashboardBtn
            ?.classList.remove("active-nav");

        DOM.navigation.analyticsBtn
            ?.classList.remove("active-nav");
    },

    showDashboard() {

        this.hideAllViews();

        DOM.views.dashboard
            .classList.remove("hidden");

        DOM.views.dashboard
            .classList.add("active-view");

        DOM.navigation.dashboardBtn
            ?.classList.add("active-nav");
    },

    showDeck() {

        this.hideAllViews();

        DOM.views.deck
            .classList.remove("hidden");

        DOM.views.deck
            .classList.add("active-view");
    },

    showStudy() {

        this.hideAllViews();

        DOM.views.study
            .classList.remove("hidden");

        DOM.views.study
            .classList.add("active-view");
    },

    showSummary() {

        this.hideAllViews();

        DOM.views.summary
            .classList.remove("hidden");

        DOM.views.summary
            .classList.add("active-view");
    },

    showAnalytics() {

        this.hideAllViews();

        DOM.views.analytics
            .classList.remove("hidden");

        DOM.views.analytics
            .classList.add("active-view");

        DOM.navigation.analyticsBtn
            ?.classList.add("active-nav");
    }


};

/* ==================================================
MODAL MANAGER
================================================== */

const ModalManager = {


    open(modal) {

        if (
            modal &&
            typeof modal.showModal === "function"
        ) {
            modal.showModal();
        }
    },

    close(modal) {

        if (
            modal &&
            modal.open
        ) {
            modal.close();
        }
    },

    closeAll() {

        Object.values(DOM.modals)
            .forEach(modal => {

                if (modal?.open) {
                    modal.close();
                }
            });
    }


};
