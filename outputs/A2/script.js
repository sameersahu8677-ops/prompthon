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

    modalTitles: {
        createDeck: document.getElementById(
            "create-deck-modal-heading"
        ),

        addCard: document.getElementById(
            "add-card-modal-heading"
        )
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

    emptyStates: {
        dashboard: document.getElementById("dashboard-empty-state"),
        cards: document.getElementById("cards-empty-state")
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

    deck: {
        activeDeckName: document.getElementById("active-deck-name")
    },

    study: {
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
        `${safeType}-toast`
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

/* ==================================================
DECK MANAGER
================================================== */

const DeckManager = {


    createDeck(name) {

        const validation =
            ValidationManager.validateDeckName(name);

        if (!validation.valid) {
            showToast(validation.message, "error");
            return null;
        }

        const timestamp = getCurrentTimestamp();

        const deck = {
            id: generateId(),
            name: name.trim(),

            createdAt: timestamp,
            updatedAt: timestamp,

            cards: []
        };

        state.decks.push(deck);

        StorageManager.save();

        showToast(
            "Deck created successfully.",
            "success"
        );

        return deck;
    },

    renameDeck(deckId, newName) {

        const validation =
            ValidationManager.validateDeckName(newName);

        if (!validation.valid) {
            showToast(validation.message, "error");
            return false;
        }

        const deck =
            this.getDeck(deckId);

        if (!deck) {
            showToast(
                "Deck not found.",
                "error"
            );
            return false;
        }

        deck.name = newName.trim();
        deck.updatedAt =
            getCurrentTimestamp();

        StorageManager.save();

        showToast(
            "Deck renamed successfully.",
            "success"
        );

        return true;
    },

    deleteDeck(deckId) {

        const deck =
            this.getDeck(deckId);

        if (!deck) {
            return false;
        }

        const confirmed =
            confirm(
                `Delete "${deck.name}"?`
            );

        if (!confirmed) {
            return false;
        }

        state.decks =
            state.decks.filter(
                d => d.id !== deckId
            );

        if (
            state.activeDeckId === deckId
        ) {
            state.activeDeckId = null;
        }

        StorageManager.save();

        showToast(
            "Deck deleted.",
            "success"
        );

        return true;
    },

    openDeck(deckId) {

        const deck =
            this.getDeck(deckId);

        if (!deck) {
            showToast(
                "Deck not found.",
                "error"
            );
            return false;
        }

        state.activeDeckId = deckId;

        StorageManager.save();

        return true;
    },

    getDeck(deckId) {

        return state.decks.find(
            deck => deck.id === deckId
        ) || null;
    }


};

/* ==================================================
FLASHCARD MANAGER
================================================== */

const FlashcardManager = {


    addCard(question, answer) {

        const deck =
            getActiveDeck();

        if (!deck) {

            showToast(
                "No active deck selected.",
                "warning"
            );

            return null;
        }

        const validation =
            ValidationManager.validateCard(
                question,
                answer
            );

        if (!validation.valid) {

            showToast(
                validation.message,
                "error"
            );

            return null;
        }

        const timestamp =
            getCurrentTimestamp();

        const card = {
            id: generateId(),

            question: question.trim(),
            answer: answer.trim(),

            box: 1,

            correctCount: 0,
            wrongCount: 0,

            lastReviewed: null,

            createdAt: timestamp,
            updatedAt: timestamp
        };

        deck.cards.push(card);

        deck.updatedAt = timestamp;

        StorageManager.save();

        showToast(
            "Card added successfully.",
            "success"
        );

        return card;
    },

    editCard(
        cardId,
        question,
        answer
    ) {

        const card =
            this.getCard(cardId);

        if (!card) {

            showToast(
                "Card not found.",
                "error"
            );

            return false;
        }

        const validation =
            ValidationManager.validateCard(
                question,
                answer
            );

        if (!validation.valid) {

            showToast(
                validation.message,
                "error"
            );

            return false;
        }

        card.question =
            question.trim();

        card.answer =
            answer.trim();

        card.updatedAt =
            getCurrentTimestamp();

        StorageManager.save();

        showToast(
            "Card updated.",
            "success"
        );

        return true;
    },

    deleteCard(cardId) {

        const deck =
            getActiveDeck();

        if (!deck) {
            return false;
        }

        const card =
            this.getCard(cardId);

        if (!card) {
            return false;
        }

        const confirmed =
            confirm(
                "Delete this flashcard?"
            );

        if (!confirmed) {
            return false;
        }

        deck.cards =
            deck.cards.filter(
                card => card.id !== cardId
            );

        deck.updatedAt =
            getCurrentTimestamp();

        StorageManager.save();

        showToast(
            "Card deleted.",
            "success"
        );

        return true;
    },

    bulkImport(text) {

        const deck =
            getActiveDeck();

        if (!deck) {

            showToast(
                "No active deck selected.",
                "warning"
            );

            return {
                imported: 0,
                skipped: 0
            };
        }

        const lines =
            text.split("\n");

        let imported = 0;
        let skipped = 0;

        lines.forEach(line => {

            const validation =
                ValidationManager
                    .validateBulkImportLine(
                        line
                    );

            if (!validation.valid) {

                skipped++;
                return;
            }

            const [
                question,
                answer
            ] = line
                .split("|")
                .map(item => item.trim());

            const timestamp =
                getCurrentTimestamp();

            deck.cards.push({
                id: generateId(),

                question,
                answer,

                box: 1,

                correctCount: 0,
                wrongCount: 0,

                lastReviewed: null,

                createdAt: timestamp,
                updatedAt: timestamp
            });

            imported++;
        });

        deck.updatedAt =
            getCurrentTimestamp();

        StorageManager.save();

        return {
            imported,
            skipped
        };
    },

    getCard(cardId) {

        const deck =
            getActiveDeck();

        if (!deck) {
            return null;
        }

        return deck.cards.find(
            card => card.id === cardId
        ) || null;
    }


};

/* ==================================================
LEITNER ENGINE
================================================== */

const LeitnerEngine = {


    promote(card) {

        if (!card) {
            return;
        }

        const promotions = {
            1: 2,
            2: 3,
            3: 4,
            4: 5,
            5: 5
        };

        card.box =
            promotions[card.box] || 1;

        card.correctCount++;

        card.lastReviewed =
            getCurrentTimestamp();
    },

    demote(card) {

        if (!card) {
            return;
        }

        const demotions = {
            1: 1,
            2: 1,
            3: 1,
            4: 2,
            5: 3
        };

        card.box =
            demotions[
            card.box
            ] || 1;

        card.wrongCount++;

        card.lastReviewed =
            getCurrentTimestamp();
    },

    getStatus(box) {

        const statuses = {
            1: "Learning",
            2: "Improving",
            3: "Familiar",
            4: "Strong",
            5: "Mastered"
        };

        return (
            statuses[box] ||
            "Learning"
        );
    }


};

/* ==================================================
QUEUE MANAGER
================================================== */

const QueueManager = {


    weights: {
        1: 5,
        2: 4,
        3: 3,
        4: 2,
        5: 1
    },

    createQueue(deck) {

        if (
            !deck ||
            !Array.isArray(deck.cards)
        ) {
            return [];
        }

        const queue = [];

        deck.cards.forEach(card => {

            const weight =
                this.weights[
                card.box
                ] || 1;

            for (
                let i = 0;
                i < weight;
                i++
            ) {
                queue.push(card.id);
            }
        });

        return this.shuffle(queue);
    },

    shuffle(array) {

        const copy =
            [...array];

        for (
            let i =
                copy.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );

            [
                copy[i],
                copy[j]
            ] = [
                    copy[j],
                    copy[i]
                ];
        }

        return copy;
    },

    getNextCard() {

        if (
            !state.activeSession
        ) {
            return null;
        }

        const nextId =
            state.activeSession
                .queue
                .shift();

        if (!nextId) {
            return null;
        }

        state.activeSession
            .currentCardId =
            nextId;

        return nextId;
    },

    reinsertFailedCard(cardId) {

        if (
            !state.activeSession
        ) {
            return;
        }

        const queue =
            state.activeSession.queue;

        const gap =
            Math.min(
                3,
                queue.length
            );

        queue.splice(
            gap,
            0,
            cardId
        );
    },

    isSessionComplete() {

        return (
            !state.activeSession ||
            state.activeSession
                .queue.length === 0
        );
    }


};

/* ==================================================
ANALYTICS MANAGER
================================================== */

const AnalyticsManager = {


    getDeckStats(deck) {

        if (!deck) {

            return {
                totalCards: 0,
                masteredCards: 0,
                totalReviews: 0,
                correct: 0,
                wrong: 0,
                accuracy: 0
            };
        }

        let masteredCards = 0;
        let correct = 0;
        let wrong = 0;

        deck.cards.forEach(card => {

            if (card.box === 5) {
                masteredCards++;
            }

            correct +=
                card.correctCount || 0;

            wrong +=
                card.wrongCount || 0;
        });

        const totalReviews =
            correct + wrong;

        const accuracy =
            totalReviews
                ? (
                    correct /
                    totalReviews
                ) * 100
                : 0;

        return {
            totalCards:
                deck.cards.length,

            masteredCards,

            totalReviews,

            correct,

            wrong,

            accuracy
        };
    },

    getGlobalStats() {

        let totalCards = 0;
        let masteredCards = 0;
        let correct = 0;
        let wrong = 0;

        state.decks.forEach(deck => {

            const stats =
                this.getDeckStats(
                    deck
                );

            totalCards +=
                stats.totalCards;

            masteredCards +=
                stats.masteredCards;

            correct +=
                stats.correct;

            wrong +=
                stats.wrong;
        });

        const totalReviews =
            correct + wrong;

        const accuracy =
            totalReviews
                ? (
                    correct /
                    totalReviews
                ) * 100
                : 0;

        return {
            totalDecks:
                state.decks.length,

            totalCards,

            masteredCards,

            totalReviews,

            correct,

            wrong,

            accuracy
        };
    },

    getBoxDistribution(deck) {

        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };

        if (
            !deck ||
            !Array.isArray(deck.cards)
        ) {
            return distribution;
        }

        deck.cards.forEach(card => {

            const safeBox =
                Number(card.box);

            if (
                Number.isInteger(safeBox) &&
                safeBox >= 1 &&
                safeBox <= 5
            ) {
                distribution[safeBox]++;
            }
        });

        return distribution;
    }


};

/* ==================================================
RENDER MANAGER
================================================== */

const RenderManager = {


    renderDashboard() {

        const stats =
            AnalyticsManager.getGlobalStats();

        if (DOM.statistics.totalDecks) {
            DOM.statistics.totalDecks.textContent =
                stats.totalDecks;
        }

        if (DOM.statistics.totalCards) {
            DOM.statistics.totalCards.textContent =
                stats.totalCards;
        }

        if (DOM.statistics.totalMasteredCards) {
            DOM.statistics.totalMasteredCards.textContent =
                stats.masteredCards;
        }

        if (!DOM.containers.deckGrid) {
            return;
        }

        DOM.containers.deckGrid.innerHTML = "";

        if (!state.decks.length) {

            DOM.emptyStates?.dashboard?.classList.remove("hidden");

            return;
        }

        DOM.emptyStates?.dashboard?.classList.add("hidden");

        state.decks.forEach(deck => {

            const deckStats =
                AnalyticsManager.getDeckStats(deck);

            const card =
                document.createElement("article");

            card.className = "deck-card";

            card.innerHTML = `
    < h3 > ${escapeHtml(deck.name)}</h3 >

            <p>${deck.cards.length} Cards</p>

            <p>${deckStats.masteredCards} Mastered</p>

            <div class="deck-actions">

                <button
                    class="btn-primary open-deck-btn"
                    data-deck-id="${deck.id}">
                    Open
                </button>

                <button
                    class="btn-secondary rename-deck-btn"
                    data-deck-id="${deck.id}">
                    Rename
                </button>

                <button
                    class="btn-danger delete-deck-btn"
                    data-deck-id="${deck.id}">
                    Delete
                </button>

            </div>
`;

            DOM.containers.deckGrid.appendChild(card);
        });
    },

    renderDeck() {

        const deck =
            getActiveDeck();

        if (!deck) {
            return;
        }

        if (DOM.deck?.activeDeckName) {
            DOM.deck.activeDeckName.textContent =
                deck.name;
        }

        const stats =
            AnalyticsManager.getDeckStats(deck);

        if (DOM.statistics.deckTotalCards) {
            DOM.statistics.deckTotalCards.textContent =
                stats.totalCards;
        }

        if (DOM.statistics.deckMasteredCards) {
            DOM.statistics.deckMasteredCards.textContent =
                stats.masteredCards;
        }

        if (DOM.statistics.deckAccuracy) {
            DOM.statistics.deckAccuracy.textContent =
                `${stats.accuracy.toFixed(1)}% `;
        }

        DOM.containers.cardList.innerHTML = "";

        if (!deck.cards.length) {

            DOM.emptyStates?.cards?.classList.remove("hidden");

            return;
        }

        DOM.emptyStates?.cards?.classList.add("hidden");

        deck.cards.forEach(card => {

            const item =
                document.createElement("div");

            item.className =
                "flashcard-item";

            item.innerHTML = `
    < div >

                <strong>
                    ${escapeHtml(card.question)}
                </strong>

                <p>
                    Box ${card.box}
                    •
                    ${LeitnerEngine.getStatus(card.box)}
                </p>

            </div >

    <div>

        <button
            class="btn-secondary edit-card-btn"
            data-card-id="${card.id}">
            Edit
        </button>

        <button
            class="btn-danger delete-card-btn"
            data-card-id="${card.id}">
            Delete
        </button>

    </div>
`;

            DOM.containers.cardList.appendChild(item);
        });
    },

    renderAnalytics() {

        const globalStats =
            AnalyticsManager.getGlobalStats();

        if (DOM.statistics.analyticsReviews) {
            DOM.statistics.analyticsReviews.textContent =
                globalStats.totalReviews;
        }

        if (DOM.statistics.analyticsAccuracy) {
            DOM.statistics.analyticsAccuracy.textContent =
                `${globalStats.accuracy.toFixed(1)}% `;
        }

        if (DOM.statistics.analyticsMastered) {
            DOM.statistics.analyticsMastered.textContent =
                globalStats.masteredCards;
        }

        const deck =
            getActiveDeck();

        const distribution =
            deck
                ? AnalyticsManager.getBoxDistribution(deck)
                : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        if (DOM.analytics.box1) DOM.analytics.box1.textContent = distribution[1];
        if (DOM.analytics.box2) DOM.analytics.box2.textContent = distribution[2];
        if (DOM.analytics.box3) DOM.analytics.box3.textContent = distribution[3];
        if (DOM.analytics.box4) DOM.analytics.box4.textContent = distribution[4];
        if (DOM.analytics.box5) DOM.analytics.box5.textContent = distribution[5];
    },

    renderSession() {

        const card =
            getCurrentSessionCard();

        if (!card || !state.activeSession) {
            return;
        }

        DOM.study.questionDisplay.textContent =
            card.question;

        DOM.study.answerDisplay.textContent =
            state.activeSession.answerRevealed
                ? card.answer
                : "Answer hidden";

        DOM.statistics.cardsRemaining.textContent =
            state.activeSession.queue.length;

        const reviewed =
            state.activeSession.reviewed || 0;

        DOM.statistics.sessionScore.textContent =
            `${state.activeSession.correct}/${reviewed}`;

        DOM.statistics.currentBox.textContent =
            card.box;

        DOM.statistics.currentStatus.textContent =
            LeitnerEngine.getStatus(card.box);

        DOM.buttons.gotItRight.disabled =
            !state.activeSession.answerRevealed;

        DOM.buttons.gotItWrong.disabled =
            !state.activeSession.answerRevealed;

        DOM.buttons.revealAnswer.disabled =
            state.activeSession.answerRevealed;
    },

    renderSummary() {

        const session =
            state.activeSession;

        if (!session) {
            return;
        }

        const accuracy =
            session.reviewed
                ? (session.correct / session.reviewed) * 100
                : 0;

        DOM.statistics.summaryReviewed.textContent =
            session.reviewed;

        DOM.statistics.summaryCorrect.textContent =
            session.correct;

        DOM.statistics.summaryWrong.textContent =
            session.wrong;

        DOM.statistics.summaryAccuracy.textContent =
            `${accuracy.toFixed(1)}%`;

        DOM.statistics.summaryMastered.textContent =
            session.mastered;
    }


};

/* ==================================================
SESSION HELPERS
================================================== */

function getCurrentSessionCard() {


    const session =
        state.activeSession;

    if (!session) {
        return null;
    }

    return FlashcardManager.getCard(
        session.currentCardId
    );


}

function startStudySession() {


    const deck =
        getActiveDeck();

    if (!deck) {

        showToast(
            "Select a deck first.",
            "warning"
        );

        return;
    }

    if (!deck.cards.length) {

        showToast(
            "Add cards before starting a quiz.",
            "warning"
        );

        return;
    }

    state.activeSession = {

        deckId: deck.id,

        queue:
            QueueManager.createQueue(deck),

        currentCardId: null,

        reviewed: 0,
        correct: 0,
        wrong: 0,

        mastered: 0,

        answerRevealed: false,

        completed: false
    };

    loadNextCard();

    ViewManager.showStudy();

    RenderManager.renderSession();


}

function loadNextCard() {


    if (!state.activeSession) {
        return;
    }

    const nextCardId =
        QueueManager.getNextCard();

    if (!nextCardId) {

        completeSession();

        return;
    }

    state.activeSession.currentCardId =
        nextCardId;

    state.activeSession.answerRevealed =
        false;

    if (DOM.study.cardMovementMessage) {
        DOM.study.cardMovementMessage.textContent = "";
    }

    if (DOM.study.schedulingMessage) {
        DOM.study.schedulingMessage.textContent = "";
    }

    RenderManager.renderSession();


}

function completeSession() {


    if (!state.activeSession) {
        return;
    }

    state.activeSession.completed =
        true;

    StorageManager.save();

    RenderManager.renderSummary();

    ViewManager.showSummary();


}

/* ==================================================
QUIZ FLOW
================================================== */

function revealAnswer() {


    if (!state.activeSession) {
        return;
    }

    state.activeSession.answerRevealed =
        true;

    RenderManager.renderSession();


}

function handleCorrectAnswer() {


    const card =
        getCurrentSessionCard();

    if (!card) {
        return;
    }

    LeitnerEngine.promote(card);

    state.activeSession.reviewed++;
    state.activeSession.correct++;

    const previousBox = card.box;

    LeitnerEngine.promote(card);

    if (
        previousBox !== 5 &&
        card.box === 5
    ) {
        state.activeSession.mastered++;
    }

    if (DOM.study.cardMovementMessage) {

        DOM.study.cardMovementMessage.textContent =
            `Promoted to Box ${card.box}`;
    }

    StorageManager.save();

    loadNextCard();


}

function handleWrongAnswer() {


    const card =
        getCurrentSessionCard();

    if (!card) {
        return;
    }

    LeitnerEngine.demote(card);

    state.activeSession.reviewed++;
    state.activeSession.wrong++;

    QueueManager.reinsertFailedCard(
        card.id
    );

    if (DOM.study.schedulingMessage) {

        DOM.study.schedulingMessage.textContent =
            "Card scheduled for earlier review.";
    }

    StorageManager.save();

    loadNextCard();


}
