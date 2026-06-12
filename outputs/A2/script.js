/* ==================================================
   FLASH CARD STUDY BUDDY
   PART A - CORE ENGINE
================================================== */

const STORAGE_KEY = "flash-study-buddy";

/* ==================================================
   APPLICATION STATE
================================================== */

const state = {
    decks: [],
    activeDeckId: null,

    activeSession: null,

    ui: {
        editingCardId: null,
        editingDeckId: null
    }
};

/* ==================================================
   UTILITIES
================================================== */

function generateId() {
    return crypto.randomUUID();
}

function getTimestamp() {
    return Date.now();
}

function getActiveDeck() {
    return state.decks.find(
        deck => deck.id === state.activeDeckId
    ) || null;
}

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

/* ==================================================
   STORAGE MANAGER
================================================== */

const StorageManager = {

    load() {

        try {

            const savedData =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!savedData) {
                return;
            }

            const parsed =
                JSON.parse(savedData);

            state.decks =
                Array.isArray(parsed.decks)
                    ? parsed.decks
                    : [];

            state.activeDeckId =
                parsed.activeDeckId || null;

            state.activeSession = null;

        } catch (error) {

            console.error(
                "Storage load failed:",
                error
            );

            state.decks = [];
            state.activeDeckId = null;
            state.activeSession = null;
        }
    },

    save() {

        try {

            const data = {
                decks: state.decks,
                activeDeckId:
                    state.activeDeckId
            };

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

        } catch (error) {

            console.error(
                "Storage save failed:",
                error
            );
        }
    },

    reset() {

        localStorage.removeItem(
            STORAGE_KEY
        );

        state.decks = [];
        state.activeDeckId = null;
        state.activeSession = null;
    }
};

/* ==================================================
   VALIDATION
================================================== */

const ValidationManager = {

    validateDeckName(name) {

        if (
            typeof name !== "string"
        ) {
            return false;
        }

        return name.trim().length > 0;
    },

    validateCard(
        question,
        answer
    ) {

        if (
            typeof question !== "string" ||
            typeof answer !== "string"
        ) {
            return false;
        }

        return (
            question.trim().length > 0 &&
            answer.trim().length > 0
        );
    },

    validateBulkLine(line) {

        if (
            typeof line !== "string"
        ) {
            return false;
        }

        const parts =
            line.split("|");

        if (parts.length !== 2) {
            return false;
        }

        return (
            parts[0].trim() &&
            parts[1].trim()
        );
    }
};

/* ==================================================
   TOAST
================================================== */

function showToast(
    message,
    type = "info"
) {

    let container =
        document.querySelector(
            ".toast-container"
        );

    if (!container) {

        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}-toast`;

    toast.textContent =
        message;

    container.appendChild(
        toast
    );

    setTimeout(() => {

        toast.remove();

    }, 3000);
}

/* ==================================================
   DECK MANAGER
================================================== */

const DeckManager = {

    createDeck(name) {

        if (
            !ValidationManager.validateDeckName(
                name
            )
        ) {

            showToast(
                "Enter a valid deck name.",
                "error"
            );

            return null;
        }

        const deck = {

            id:
                generateId(),

            name:
                name.trim(),

            createdAt:
                getTimestamp(),

            cards: []
        };

        state.decks.push(deck);

        StorageManager.save();

        showToast(
            "Deck created.",
            "success"
        );

        return deck;
    },

    renameDeck(
        deckId,
        newName
    ) {

        if (
            !ValidationManager.validateDeckName(
                newName
            )
        ) {

            showToast(
                "Invalid deck name.",
                "error"
            );

            return false;
        }

        const deck =
            this.getDeck(deckId);

        if (!deck) {
            return false;
        }

        deck.name =
            newName.trim();

        StorageManager.save();

        showToast(
            "Deck renamed.",
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
                deck =>
                    deck.id !== deckId
            );

        if (
            state.activeDeckId ===
            deckId
        ) {

            state.activeDeckId =
                null;
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
            return false;
        }

        state.activeDeckId =
            deckId;

        StorageManager.save();

        return true;
    },

    getDeck(deckId) {

        return state.decks.find(
            deck =>
                deck.id === deckId
        ) || null;
    }
};

/* ==================================================
   FLASHCARD MANAGER
================================================== */

const FlashcardManager = {

    addCard(
        question,
        answer
    ) {

        const deck =
            getActiveDeck();

        if (!deck) {

            showToast(
                "No active deck.",
                "warning"
            );

            return null;
        }

        if (
            !ValidationManager.validateCard(
                question,
                answer
            )
        ) {

            showToast(
                "Question and answer required.",
                "error"
            );

            return null;
        }

        const card = {

            id:
                generateId(),

            question:
                question.trim(),

            answer:
                answer.trim(),

            box: 1,

            correctCount: 0,
            wrongCount: 0,

            createdAt:
                getTimestamp(),

            updatedAt:
                getTimestamp()
        };

        deck.cards.push(card);

        StorageManager.save();

        showToast(
            "Card added.",
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
            return false;
        }

        if (
            !ValidationManager.validateCard(
                question,
                answer
            )
        ) {

            showToast(
                "Invalid card.",
                "error"
            );

            return false;
        }

        card.question =
            question.trim();

        card.answer =
            answer.trim();

        card.updatedAt =
            getTimestamp();

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

        const confirmed =
            confirm(
                "Delete this card?"
            );

        if (!confirmed) {
            return false;
        }

        deck.cards =
            deck.cards.filter(
                card =>
                    card.id !== cardId
            );

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

            if (
                !ValidationManager.validateBulkLine(
                    line
                )
            ) {

                skipped++;

                return;
            }

            const [
                question,
                answer
            ] =
                line.split("|");

            deck.cards.push({

                id:
                    generateId(),

                question:
                    question.trim(),

                answer:
                    answer.trim(),

                box: 1,

                correctCount: 0,
                wrongCount: 0,

                createdAt:
                    getTimestamp(),

                updatedAt:
                    getTimestamp()
            });

            imported++;
        });

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
            card =>
                card.id === cardId
        ) || null;
    }
};

/* ==================================================
   LEITNER ENGINE
================================================== */

const LeitnerEngine = {

    promote(card) {

        const map = {
            1: 2,
            2: 3,
            3: 4,
            4: 5,
            5: 5
        };

        card.box =
            map[card.box] || 1;

        card.correctCount++;
    },

    demote(card) {

        const map = {
            1: 1,
            2: 1,
            3: 1,
            4: 2,
            5: 3
        };

        card.box =
            map[card.box] || 1;

        card.wrongCount++;
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
   ANALYTICS MANAGER
================================================== */

const AnalyticsManager = {

    getDeckStats(deck) {

        if (!deck) {

            return {
                totalCards: 0,
                masteredCards: 0,
                accuracy: 0
            };
        }

        const totalCards =
            deck.cards.length;

        const masteredCards =
            deck.cards.filter(
                card =>
                    card.box === 5
            ).length;

        let correct = 0;
        let wrong = 0;

        deck.cards.forEach(card => {

            correct +=
                card.correctCount;

            wrong +=
                card.wrongCount;
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

            totalCards,

            masteredCards,

            accuracy
        };
    },

    getGlobalStats() {

        let totalCards = 0;

        let masteredCards = 0;

        let totalReviews = 0;

        let correct = 0;

        state.decks.forEach(deck => {

            totalCards +=
                deck.cards.length;

            deck.cards.forEach(card => {

                if (
                    card.box === 5
                ) {

                    masteredCards++;
                }

                correct +=
                    card.correctCount;

                totalReviews +=
                    card.correctCount +
                    card.wrongCount;
            });
        });

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

        if (!deck) {
            return distribution;
        }

        deck.cards.forEach(card => {

            if (
                distribution[
                card.box
                ] !== undefined
            ) {

                distribution[
                    card.box
                ]++;
            }
        });

        return distribution;
    }
};


/* ==================================================
   PART B
   DOM CACHE
   VIEWS
   MODALS
   QUEUE
   SESSION
   QUIZ
   RENDERING
================================================== */

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
        dashboard: document.getElementById("nav-dashboard-btn"),
        analytics: document.getElementById("nav-analytics-btn")
    },

    dashboard: {
        totalDecks: document.getElementById("total-decks-value"),
        totalCards: document.getElementById("total-cards-value"),
        masteredCards: document.getElementById("total-mastered-cards-value"),
        deckGrid: document.getElementById("deck-grid-container")
    },

    deck: {
        activeDeckName: document.getElementById("active-deck-name"),
        totalCards: document.getElementById("deck-total-cards-value"),
        masteredCards: document.getElementById("deck-mastered-cards-value"),
        accuracy: document.getElementById("deck-accuracy-value"),
        cardList: document.getElementById("card-list-container")
    },

    study: {
        cardsRemaining: document.getElementById("cards-remaining-value"),
        sessionScore: document.getElementById("session-score-value"),
        currentBox: document.getElementById("current-box-value"),
        currentStatus: document.getElementById("current-status-value"),

        question: document.getElementById("question-display"),
        answer: document.getElementById("answer-display"),

        cardMovement: document.getElementById("card-movement-message"),
        scheduling: document.getElementById("scheduling-message"),

        revealBtn: document.getElementById("reveal-answer-btn"),
        rightBtn: document.getElementById("got-it-right-btn"),
        wrongBtn: document.getElementById("got-it-wrong-btn")
    },

    summary: {
        reviewed: document.getElementById("summary-reviewed-value"),
        correct: document.getElementById("summary-correct-value"),
        wrong: document.getElementById("summary-wrong-value"),
        accuracy: document.getElementById("summary-accuracy-value"),
        mastered: document.getElementById("summary-mastered-value")
    },

    analytics: {
        reviews: document.getElementById("analytics-total-reviews-value"),
        accuracy: document.getElementById("analytics-accuracy-value"),
        mastered: document.getElementById("analytics-mastered-cards-value"),

        box1: document.getElementById("box-1-count"),
        box2: document.getElementById("box-2-count"),
        box3: document.getElementById("box-3-count"),
        box4: document.getElementById("box-4-count"),
        box5: document.getElementById("box-5-count")
    },

    modals: {
        createDeck: document.getElementById("create-deck-modal"),
        addCard: document.getElementById("add-card-modal"),
        bulkAdd: document.getElementById("bulk-add-modal")
    }
};

/* ==================================================
   VIEW MANAGER
================================================== */

const ViewManager = {

    hideAllViews() {

        Object.values(DOM.views)
            .forEach(view => {

                if (!view) return;

                view.classList.add("hidden");
                view.classList.remove("active-view");
            });
    },

    showDashboard() {

        this.hideAllViews();

        DOM.views.dashboard?.classList.remove("hidden");
        DOM.views.dashboard?.classList.add("active-view");
    },

    showDeck() {

        this.hideAllViews();

        DOM.views.deck?.classList.remove("hidden");
        DOM.views.deck?.classList.add("active-view");
    },

    showStudy() {

        this.hideAllViews();

        DOM.views.study?.classList.remove("hidden");
        DOM.views.study?.classList.add("active-view");
    },

    showSummary() {

        this.hideAllViews();

        DOM.views.summary?.classList.remove("hidden");
        DOM.views.summary?.classList.add("active-view");
    },

    showAnalytics() {

        this.hideAllViews();

        DOM.views.analytics?.classList.remove("hidden");
        DOM.views.analytics?.classList.add("active-view");
    }
};

/* ==================================================
   MODAL MANAGER
================================================== */

const ModalManager = {

    open(modal) {

        if (
            modal &&
            typeof modal.showModal === "function" &&
            !modal.open
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

                this.close(modal);
            });
    }
};

/* ==================================================
   LEITNER ENHANCEMENT
================================================== */

LeitnerEngine.getMovementMessage = function (
    oldBox,
    newBox
) {

    if (
        oldBox !== 5 &&
        newBox === 5
    ) {

        return "Mastered card reached Box 5";
    }

    if (
        newBox > oldBox
    ) {

        return `Promoted from Box ${oldBox} to Box ${newBox}`;
    }

    if (
        newBox < oldBox
    ) {

        return `Moved back from Box ${oldBox} to Box ${newBox}`;
    }

    return `Remains in Box ${newBox}`;
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

        const queue = [];

        deck.cards.forEach(card => {

            const weight =
                this.weights[card.box] || 1;

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

        const copy = [...array];

        for (
            let i = copy.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [copy[i], copy[j]] =
                [copy[j], copy[i]];
        }

        return copy;
    },

    getNextCard() {

        if (
            !state.activeSession
        ) {

            return null;
        }

        return (
            state.activeSession.queue.shift()
            || null
        );
    },

    reinsertFailedCard(cardId) {

        if (
            !state.activeSession
        ) {

            return;
        }

        const queue =
            state.activeSession.queue;

        const insertionIndex =
            Math.min(
                3,
                queue.length
            );

        queue.splice(
            insertionIndex,
            0,
            cardId
        );
    }
};

/* ==================================================
   SESSION ENGINE
================================================== */

function getCurrentSessionCard() {

    if (
        !state.activeSession ||
        !state.activeSession.currentCardId
    ) {

        return null;
    }

    return FlashcardManager.getCard(
        state.activeSession.currentCardId
    );
}

function startStudySession() {

    const deck =
        getActiveDeck();

    if (!deck) {

        showToast(
            "No active deck selected.",
            "warning"
        );

        return;
    }

    if (
        deck.cards.length === 0
    ) {

        showToast(
            "This deck has no cards.",
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
}

function loadNextCard() {

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

    if (
        DOM.study.cardMovement
    ) {

        DOM.study.cardMovement.textContent =
            "";
    }

    if (
        DOM.study.scheduling
    ) {

        DOM.study.scheduling.textContent =
            "";
    }

    RenderManager.renderSession();
}

function completeSession() {

    state.activeSession.completed =
        true;

    RenderManager.renderSummary();

    ViewManager.showSummary();
}

/* ==================================================
   QUIZ FLOW
================================================== */

function revealAnswer() {

    if (
        !state.activeSession
    ) {

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

    const previousBox =
        card.box;

    LeitnerEngine.promote(card);

    state.activeSession.reviewed++;
    state.activeSession.correct++;

    if (
        previousBox !== 5 &&
        card.box === 5
    ) {

        state.activeSession.mastered++;
    }

    DOM.study.cardMovement.textContent =
        LeitnerEngine.getMovementMessage(
            previousBox,
            card.box
        );

    StorageManager.save();

    loadNextCard();
}

function handleWrongAnswer() {

    const card =
        getCurrentSessionCard();

    if (!card) {
        return;
    }

    const previousBox =
        card.box;

    LeitnerEngine.demote(card);

    state.activeSession.reviewed++;
    state.activeSession.wrong++;

    QueueManager.reinsertFailedCard(
        card.id
    );

    DOM.study.cardMovement.textContent =
        LeitnerEngine.getMovementMessage(
            previousBox,
            card.box
        );

    DOM.study.scheduling.textContent =
        "This card will appear again soon.";

    StorageManager.save();

    loadNextCard();
}

/* ==================================================
   RENDER MANAGER
================================================== */

const RenderManager = {

    renderDashboard() {

        const stats =
            AnalyticsManager.getGlobalStats();

        if (DOM.dashboard.totalDecks)
            DOM.dashboard.totalDecks.textContent =
                stats.totalDecks;

        if (DOM.dashboard.totalCards)
            DOM.dashboard.totalCards.textContent =
                stats.totalCards;

        if (DOM.dashboard.masteredCards)
            DOM.dashboard.masteredCards.textContent =
                stats.masteredCards;

        if (!DOM.dashboard.deckGrid)
            return;

        DOM.dashboard.deckGrid.innerHTML =
            "";

        if (
            state.decks.length === 0
        ) {

            DOM.dashboard.deckGrid.innerHTML =
                `
                <div class="empty-state">
                    <p>No decks yet. Create your first deck.</p>
                </div>
                `;

            return;
        }

        state.decks.forEach(deck => {

            const deckStats =
                AnalyticsManager.getDeckStats(deck);

            const card =
                document.createElement("div");

            card.className =
                "deck-card";

            card.innerHTML =
                `
                <h3>${escapeHtml(deck.name)}</h3>

                <p>${deck.cards.length} Cards</p>

                <p>${deckStats.masteredCards} Mastered</p>

                <div class="deck-actions">

                    <button
                        data-action="open-deck"
                        data-deck-id="${deck.id}">
                        Open
                    </button>

                    <button
                        data-action="rename-deck"
                        data-deck-id="${deck.id}">
                        Rename
                    </button>

                    <button
                        data-action="delete-deck"
                        data-deck-id="${deck.id}">
                        Delete
                    </button>

                </div>
                `;

            DOM.dashboard.deckGrid.appendChild(
                card
            );
        });
    },

    renderDeck() {

        const deck =
            getActiveDeck();

        if (!deck) {
            return;
        }

        const stats =
            AnalyticsManager.getDeckStats(
                deck
            );

        DOM.deck.activeDeckName.textContent =
            deck.name;

        DOM.deck.totalCards.textContent =
            stats.totalCards;

        DOM.deck.masteredCards.textContent =
            stats.masteredCards;

        DOM.deck.accuracy.textContent =
            `${stats.accuracy.toFixed(1)}%`;

        DOM.deck.cardList.innerHTML =
            "";

        if (
            deck.cards.length === 0
        ) {

            DOM.deck.cardList.innerHTML =
                `
                <div class="empty-state">
                    <p>No flashcards yet.</p>
                </div>
                `;

            return;
        }

        deck.cards.forEach(card => {

            const item =
                document.createElement("div");

            item.className =
                "flashcard-item";

            item.innerHTML =
                `
                <div>
                    <strong>
                        ${escapeHtml(card.question)}
                    </strong>

                    <p>
                        Box ${card.box}
                        •
                        ${LeitnerEngine.getStatus(card.box)}
                    </p>
                </div>

                <div>

                    <button
                        data-action="edit-card"
                        data-card-id="${card.id}">
                        Edit
                    </button>

                    <button
                        data-action="delete-card"
                        data-card-id="${card.id}">
                        Delete
                    </button>

                </div>
                `;

            DOM.deck.cardList.appendChild(
                item
            );
        });
    },

    renderAnalytics() {

        const stats =
            AnalyticsManager.getGlobalStats();

        DOM.analytics.reviews.textContent =
            stats.totalReviews;

        DOM.analytics.accuracy.textContent =
            `${stats.accuracy.toFixed(1)}%`;

        DOM.analytics.mastered.textContent =
            stats.masteredCards;

        const deck =
            getActiveDeck();

        const distribution =
            AnalyticsManager.getBoxDistribution(
                deck
            );

        DOM.analytics.box1.textContent =
            distribution[1];

        DOM.analytics.box2.textContent =
            distribution[2];

        DOM.analytics.box3.textContent =
            distribution[3];

        DOM.analytics.box4.textContent =
            distribution[4];

        DOM.analytics.box5.textContent =
            distribution[5];
    },

    renderSession() {

        const card =
            getCurrentSessionCard();

        if (!card) {
            return;
        }

        DOM.study.question.textContent =
            card.question;

        if (
            state.activeSession.answerRevealed
        ) {

            DOM.study.answer.textContent =
                card.answer;

            DOM.study.rightBtn.disabled =
                false;

            DOM.study.wrongBtn.disabled =
                false;

            DOM.study.revealBtn.disabled =
                true;

        } else {

            DOM.study.answer.textContent =
                "Answer hidden";

            DOM.study.rightBtn.disabled =
                true;

            DOM.study.wrongBtn.disabled =
                true;

            DOM.study.revealBtn.disabled =
                false;
        }

        DOM.study.cardsRemaining.textContent =
            state.activeSession.queue.length;

        const accuracy =
            state.activeSession.reviewed
                ? (
                    state.activeSession.correct /
                    state.activeSession.reviewed
                ) * 100
                : 0;

        DOM.study.sessionScore.textContent =
            `${accuracy.toFixed(1)}%`;

        DOM.study.currentBox.textContent =
            card.box;

        DOM.study.currentStatus.textContent =
            LeitnerEngine.getStatus(
                card.box
            );
    },

    renderSummary() {

        const s =
            state.activeSession;

        const accuracy =
            s.reviewed
                ? (
                    s.correct /
                    s.reviewed
                ) * 100
                : 0;

        DOM.summary.reviewed.textContent =
            s.reviewed;

        DOM.summary.correct.textContent =
            s.correct;

        DOM.summary.wrong.textContent =
            s.wrong;

        DOM.summary.accuracy.textContent =
            `${accuracy.toFixed(1)}%`;

        DOM.summary.mastered.textContent =
            s.mastered;
    }
};

/* ==================================================
   PART C
   EVENT WIRING
   MODAL FLOWS
   NAVIGATION
   BOOTSTRAP
================================================== */

/* ==================================================
   MODAL STATE
================================================== */

let deckEditMode = false;
let cardEditMode = false;

/* ==================================================
   HELPERS
================================================== */

function resetDeckModal() {

    state.ui.editingDeckId = null;
    deckEditMode = false;

    const form =
        document.getElementById("create-deck-form");

    const input =
        document.getElementById("deck-name-input");

    const title =
        document.getElementById("create-deck-modal-title");

    if (form) form.reset();

    if (input) input.value = "";

    if (title) {
        title.textContent = "Create Deck";
    }
}

function resetCardModal() {

    state.ui.editingCardId = null;
    cardEditMode = false;

    const form =
        document.getElementById("add-card-form");

    const title =
        document.getElementById("add-card-modal-title");

    if (form) form.reset();

    if (title) {
        title.textContent = "Add Card";
    }
}

/* ==================================================
   DECK MODAL FLOW
================================================== */

function openCreateDeckModal() {

    resetDeckModal();

    ModalManager.open(
        DOM.modals.createDeck
    );
}

function openRenameDeckModal(deckId) {

    const deck =
        DeckManager.getDeck(deckId);

    if (!deck) {
        return;
    }

    deckEditMode = true;

    state.ui.editingDeckId =
        deckId;

    const input =
        document.getElementById("deck-name-input");

    const title =
        document.getElementById("create-deck-modal-title");

    if (input) {
        input.value = deck.name;
    }

    if (title) {
        title.textContent = "Rename Deck";
    }

    ModalManager.open(
        DOM.modals.createDeck
    );
}

/* ==================================================
   CARD MODAL FLOW
================================================== */

function openAddCardModal() {

    resetCardModal();

    ModalManager.open(
        DOM.modals.addCard
    );
}

function openEditCardModal(cardId) {

    const card =
        FlashcardManager.getCard(
            cardId
        );

    if (!card) {
        return;
    }

    cardEditMode = true;

    state.ui.editingCardId =
        cardId;

    const title =
        document.getElementById("add-card-modal-title");

    const question =
        document.getElementById("card-question-input");

    const answer =
        document.getElementById("card-answer-input");

    if (title) {
        title.textContent = "Edit Card";
    }

    if (question) {
        question.value =
            card.question;
    }

    if (answer) {
        answer.value =
            card.answer;
    }

    ModalManager.open(
        DOM.modals.addCard
    );
}

/* ==================================================
   BULK IMPORT FLOW
================================================== */

function openBulkImportModal() {

    ModalManager.open(
        DOM.modals.bulkAdd
    );
}

/* ==================================================
   DECK GRID EVENTS
================================================== */

function handleDeckGridClick(event) {

    const button =
        event.target.closest(
            "button"
        );

    if (!button) {
        return;
    }

    const deckId =
        button.dataset.deckId;

    if (!deckId) {
        return;
    }

    const action =
        button.dataset.action;

    try {

        switch (action) {

            case "open-deck":

                DeckManager.openDeck(
                    deckId
                );

                RenderManager.renderDeck();

                ViewManager.showDeck();

                break;

            case "rename-deck":

                openRenameDeckModal(
                    deckId
                );

                break;

            case "delete-deck":

                DeckManager.deleteDeck(
                    deckId
                );

                RenderManager.renderDashboard();

                break;
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Operation failed.",
            "error"
        );
    }
}

/* ==================================================
   CARD LIST EVENTS
================================================== */

function handleCardListClick(event) {

    const button =
        event.target.closest(
            "button"
        );

    if (!button) {
        return;
    }

    const cardId =
        button.dataset.cardId;

    if (!cardId) {
        return;
    }

    const action =
        button.dataset.action;

    try {

        switch (action) {

            case "edit-card":

                openEditCardModal(
                    cardId
                );

                break;

            case "delete-card":

                FlashcardManager.deleteCard(
                    cardId
                );

                RenderManager.renderDeck();

                break;
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Operation failed.",
            "error"
        );
    }
}

/* ==================================================
   NAVIGATION
================================================== */

function wireNavigation() {

    DOM.navigation.dashboard
        ?.addEventListener(
            "click",
            () => {

                RenderManager.renderDashboard();

                ViewManager.showDashboard();
            }
        );

    DOM.navigation.analytics
        ?.addEventListener(
            "click",
            () => {

                RenderManager.renderAnalytics();

                ViewManager.showAnalytics();
            }
        );

    document
        .getElementById(
            "return-to-deck-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                RenderManager.renderDeck();

                ViewManager.showDeck();
            }
        );

    document
        .getElementById(
            "study-again-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                startStudySession();
            }
        );
}

/* ==================================================
   QUIZ BUTTONS
================================================== */

function wireQuizButtons() {

    DOM.study.revealBtn
        ?.addEventListener(
            "click",
            revealAnswer
        );

    DOM.study.rightBtn
        ?.addEventListener(
            "click",
            handleCorrectAnswer
        );

    DOM.study.wrongBtn
        ?.addEventListener(
            "click",
            handleWrongAnswer
        );

    document
        .getElementById(
            "start-quiz-btn"
        )
        ?.addEventListener(
            "click",
            startStudySession
        );
}

/* ==================================================
   CREATE DECK
================================================== */

function wireCreateDeckModal() {

    document
        .getElementById(
            "create-deck-btn"
        )
        ?.addEventListener(
            "click",
            openCreateDeckModal
        );

    document
        .getElementById(
            "cancel-create-deck-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                ModalManager.close(
                    DOM.modals.createDeck
                );
            }
        );

    document
        .getElementById(
            "create-deck-form"
        )
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "deck-name-input"
                    );

                const name =
                    input?.value.trim();

                if (!name) {

                    showToast(
                        "Deck name required.",
                        "error"
                    );

                    return;
                }

                if (
                    deckEditMode
                ) {

                    DeckManager.renameDeck(
                        state.ui.editingDeckId,
                        name
                    );

                } else {

                    DeckManager.createDeck(
                        name
                    );
                }

                ModalManager.close(
                    DOM.modals.createDeck
                );

                resetDeckModal();

                RenderManager.renderDashboard();

                if (
                    getActiveDeck()
                ) {

                    RenderManager.renderDeck();
                }
            }
        );
}

/* ==================================================
   CARD MODAL
================================================== */

function wireCardModal() {

    document
        .getElementById(
            "add-card-btn"
        )
        ?.addEventListener(
            "click",
            openAddCardModal
        );

    document
        .getElementById(
            "cancel-add-card-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                ModalManager.close(
                    DOM.modals.addCard
                );
            }
        );

    document
        .getElementById(
            "add-card-form"
        )
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const question =
                    document.getElementById(
                        "card-question-input"
                    )?.value;

                const answer =
                    document.getElementById(
                        "card-answer-input"
                    )?.value;

                if (
                    cardEditMode
                ) {

                    FlashcardManager.editCard(
                        state.ui.editingCardId,
                        question,
                        answer
                    );

                } else {

                    FlashcardManager.addCard(
                        question,
                        answer
                    );
                }

                ModalManager.close(
                    DOM.modals.addCard
                );

                resetCardModal();

                RenderManager.renderDeck();
            }
        );
}

/* ==================================================
   BULK IMPORT
================================================== */

function wireBulkImport() {

    document
        .getElementById(
            "bulk-add-cards-btn"
        )
        ?.addEventListener(
            "click",
            openBulkImportModal
        );

    document
        .getElementById(
            "cancel-bulk-add-btn"
        )
        ?.addEventListener(
            "click",
            () => {

                ModalManager.close(
                    DOM.modals.bulkAdd
                );
            }
        );

    document
        .getElementById(
            "bulk-add-form"
        )
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const textarea =
                    document.getElementById(
                        "bulk-card-input"
                    );

                const result =
                    FlashcardManager.bulkImport(
                        textarea.value
                    );

                showToast(
                    `Imported ${result.imported}, Skipped ${result.skipped}`,
                    "success"
                );

                textarea.value = "";

                ModalManager.close(
                    DOM.modals.bulkAdd
                );

                RenderManager.renderDeck();
            }
        );
}

/* ==================================================
   DELEGATION
================================================== */

function wireDelegation() {

    DOM.dashboard.deckGrid
        ?.addEventListener(
            "click",
            handleDeckGridClick
        );

    DOM.deck.cardList
        ?.addEventListener(
            "click",
            handleCardListClick
        );
}

/* ==================================================
   INITIALIZATION
================================================== */

function initializeApplication() {

    try {

        StorageManager.load();

        wireNavigation();

        wireQuizButtons();

        wireCreateDeckModal();

        wireCardModal();

        wireBulkImport();

        wireDelegation();

        RenderManager.renderDashboard();

        ViewManager.showDashboard();

    } catch (error) {

        console.error(error);

        showToast(
            "Application failed to initialize.",
            "error"
        );
    }
}

/* ==================================================
   BOOTSTRAP
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);