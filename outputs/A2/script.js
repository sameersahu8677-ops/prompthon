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