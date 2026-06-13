/* ==========================================
   PART 1 - CORE ARCHITECTURE & STORAGE
   ========================================== */

/* ==========================================
   APPLICATION CONSTANTS
   ========================================== */

const STORAGE_KEYS = Object.freeze({
    APP_STATE: "questforge_app_state"
});

const XP_REWARDS = Object.freeze({
    easy: 5,
    medium: 10,
    hard: 20
});

const HP_CONFIG = Object.freeze({
    MIN_HP: 0,
    MAX_HP: 5,
    STARTING_HP: 5
});

const LEVEL_CONFIG = Object.freeze({
    XP_PER_LEVEL: 100
});

const ACHIEVEMENT_THRESHOLDS = Object.freeze({
    XP_100: 100,
    XP_500: 500,
    STREAK_7: 7,
    STREAK_30: 30
});

/* ==========================================
   DEFAULT APPLICATION STATE
   ========================================== */

function createDefaultState() {
    return {
        habits: [],

        player: {
            totalXP: 0,
            level: 1,
            hp: HP_CONFIG.STARTING_HP,
            currentStreak: 0,
            longestStreak: 0,

            lastLevelRewarded: 1,
            lastHPRewardStreakMilestone: 0
        },

        activityFeed: [],

        achievements: [],

        appMeta: {
            createdAt: getTodayDate(),
            lastOpenedDate: getTodayDate(),
            lastDailyCheckDate: null
        }
    };
}

/* ==========================================
   DATE UTILITIES
   ========================================== */

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isSameDay(dateA, dateB) {
    if (!dateA || !dateB) return false;

    return dateA === dateB;
}

function daysBetweenDates(startDate, endDate) {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const millisecondsPerDay = 1000 * 60 * 60 * 24;

        return Math.floor(
            (end.getTime() - start.getTime()) /
            millisecondsPerDay
        );
    } catch (error) {
        console.error("Date calculation failed:", error);
        return 0;
    }
}

function getTomorrowDate() {
    const date = new Date();

    date.setDate(date.getDate() + 1);

    return date.toISOString().split("T")[0];
}

/* ==========================================
   VALIDATION UTILITIES
   ========================================== */

function validateHabitName(name) {
    if (typeof name !== "string") {
        return false;
    }

    const trimmed = name.trim();

    if (!trimmed) {
        return false;
    }

    if (trimmed.length > 50) {
        return false;
    }

    return true;
}

function validateDifficulty(difficulty) {
    return Object.keys(XP_REWARDS).includes(difficulty);
}

function validatePlayer(player) {
    if (!player || typeof player !== "object") {
        return false;
    }

    return (
        typeof player.totalXP === "number" &&
        typeof player.level === "number" &&
        typeof player.hp === "number" &&
        typeof player.currentStreak === "number" &&
        typeof player.longestStreak === "number"
    );
}

function validateState(state) {
    if (!state || typeof state !== "object") {
        return false;
    }

    if (!Array.isArray(state.habits)) {
        return false;
    }

    if (!Array.isArray(state.activityFeed)) {
        return false;
    }

    if (!Array.isArray(state.achievements)) {
        return false;
    }

    if (!validatePlayer(state.player)) {
        return false;
    }

    if (!state.appMeta) {
        return false;
    }

    return true;
}

/* ==========================================
   STORAGE SERVICE
   ========================================== */

const StorageService = {

    saveState(state) {
        try {
            localStorage.setItem(
                STORAGE_KEYS.APP_STATE,
                JSON.stringify(state)
            );

            return true;
        } catch (error) {
            console.error("Failed to save state:", error);
            return false;
        }
    },

    loadState() {
        try {
            const rawData = localStorage.getItem(
                STORAGE_KEYS.APP_STATE
            );

            if (!rawData) {
                return createDefaultState();
            }

            const parsedData = JSON.parse(rawData);

            if (!validateState(parsedData)) {
                console.warn(
                    "Invalid saved state detected. Restoring defaults."
                );

                return createDefaultState();
            }

            return parsedData;

        } catch (error) {
            console.error(
                "Corrupted storage detected. Recovering...",
                error
            );

            return createDefaultState();
        }
    },

    resetState() {
        try {
            localStorage.removeItem(
                STORAGE_KEYS.APP_STATE
            );

            const freshState = createDefaultState();

            this.saveState(freshState);

            return freshState;

        } catch (error) {
            console.error("Reset failed:", error);

            return createDefaultState();
        }
    }
};

/* ==========================================
   GLOBAL APPLICATION STATE
   ========================================== */

let appState = createDefaultState();

/* ==========================================
   INITIALIZATION
   ========================================== */

function initializeApp() {

    const loadedState = StorageService.loadState();

    if (!validateState(loadedState)) {

        console.warn(
            "State validation failed during initialization."
        );

        appState = createDefaultState();

        StorageService.saveState(appState);

    } else {

        appState = loadedState;

    }

    appState.appMeta.lastOpenedDate = getTodayDate();

    StorageService.saveState(appState);

    console.info(
        "QuestForge initialized successfully."
    );
}