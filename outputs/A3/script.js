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

/* ==========================================
   PART 2 - HABIT MANAGEMENT SYSTEM
   ========================================== */

/* ==========================================
   HABIT HELPERS
   ========================================== */

function generateHabitId() {
    return `habit_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
}

function getXPRewardForDifficulty(difficulty) {
    return XP_REWARDS[difficulty] || 0;
}

function findHabitById(habitId) {
    return appState.habits.find(
        habit => habit.id === habitId
    );
}

function findHabitIndexById(habitId) {
    return appState.habits.findIndex(
        habit => habit.id === habitId
    );
}

function isDuplicateHabitName(name, excludeHabitId = null) {
    const normalizedName = name.trim().toLowerCase();

    return appState.habits.some(habit => {
        if (excludeHabitId && habit.id === excludeHabitId) {
            return false;
        }

        return (
            habit.name.trim().toLowerCase() === normalizedName
        );
    });
}

/* ==========================================
   HABIT CREATION
   ========================================== */

function createHabit(name, difficulty) {

    const trimmedName = name.trim();

    if (!validateHabitName(trimmedName)) {
        throw new Error(
            "Habit name must be between 1 and 50 characters."
        );
    }

    if (!validateDifficulty(difficulty)) {
        throw new Error(
            "Invalid habit difficulty."
        );
    }

    if (isDuplicateHabitName(trimmedName)) {
        throw new Error(
            "Habit name already exists."
        );
    }

    const habit = {
        id: generateHabitId(),

        name: trimmedName,

        difficulty,

        xpReward: getXPRewardForDifficulty(difficulty),

        createdDate: getTodayDate(),

        trackingStartDate: getTomorrowDate(),

        isActive: true,

        isArchived: false,

        completionHistory: {},

        missTracking: {
            consecutiveMisses: 0,
            penaltyApplied: false
        }
    };

    appState.habits.push(habit);

    StorageService.saveState(appState);

    return habit;
}

/* ==========================================
   HABIT UPDATE
   ========================================== */

function updateHabit(habitId, updates) {

    const habit = findHabitById(habitId);

    if (!habit) {
        throw new Error("Habit not found.");
    }

    const updatedName = updates.name?.trim() ?? habit.name;
    const updatedDifficulty =
        updates.difficulty ?? habit.difficulty;

    if (!validateHabitName(updatedName)) {
        throw new Error("Invalid habit name.");
    }

    if (!validateDifficulty(updatedDifficulty)) {
        throw new Error("Invalid difficulty.");
    }

    if (
        isDuplicateHabitName(
            updatedName,
            habitId
        )
    ) {
        throw new Error(
            "Habit name already exists."
        );
    }

    habit.name = updatedName;
    habit.difficulty = updatedDifficulty;
    habit.xpReward =
        getXPRewardForDifficulty(updatedDifficulty);

    StorageService.saveState(appState);

    return habit;
}

/* ==========================================
   HABIT ARCHIVE
   ========================================== */

function archiveHabit(habitId) {

    const habit = findHabitById(habitId);

    if (!habit) {
        throw new Error("Habit not found.");
    }

    habit.isArchived = true;
    habit.isActive = false;

    StorageService.saveState(appState);

    return true;
}

function restoreHabit(habitId) {

    const habit = findHabitById(habitId);

    if (!habit) {
        throw new Error("Habit not found.");
    }

    habit.isArchived = false;
    habit.isActive = true;

    StorageService.saveState(appState);

    return true;
}

/* ==========================================
   HABIT DELETION
   ========================================== */

function deleteHabit(habitId) {

    const habitIndex =
        findHabitIndexById(habitId);

    if (habitIndex === -1) {
        throw new Error("Habit not found.");
    }

    const habit = appState.habits[habitIndex];

    habit.isArchived = true;
    habit.isActive = false;
    habit.deleted = true;
    habit.deletedDate = getTodayDate();

    StorageService.saveState(appState);

    return true;
}

/* ==========================================
   COMPLETION HELPERS
   ========================================== */

function getHabitCompletionForDate(
    habit,
    date
) {
    return (
        habit.completionHistory[date] || null
    );
}

function isHabitCompletedOnDate(
    habit,
    date
) {
    const entry =
        getHabitCompletionForDate(
            habit,
            date
        );

    return Boolean(
        entry?.completed
    );
}

/* ==========================================
   DAILY COMPLETION
   ========================================== */

function toggleHabitCompletion(
    habitId,
    date = getTodayDate()
) {

    const habit = findHabitById(habitId);

    if (!habit) {
        throw new Error(
            "Habit not found."
        );
    }

    if (
        !habit.isActive ||
        habit.isArchived
    ) {
        throw new Error(
            "Habit is not active."
        );
    }

    const existingEntry =
        habit.completionHistory[date];

    if (
        existingEntry &&
        existingEntry.completed
    ) {

        habit.completionHistory[date] = {
            ...existingEntry,
            completed: false,
            uncompletedAt:
                new Date().toISOString()
        };

    } else {

        habit.completionHistory[date] = {
            completed: true,
            completedAt:
                new Date().toISOString(),
            xpAwarded: false
        };

    }

    StorageService.saveState(appState);

    return (
        habit.completionHistory[date]
    );
}

/* ==========================================
   DAILY HABIT HELPERS
   ========================================== */

function getTodaysHabits() {

    const today = getTodayDate();

    return appState.habits.filter(habit => {

        if (
            !habit.isActive ||
            habit.isArchived
        ) {
            return false;
        }

        return (
            habit.trackingStartDate <= today
        );
    });
}

function getCompletedToday() {

    const today = getTodayDate();

    return getTodaysHabits()
        .filter(habit =>
            isHabitCompletedOnDate(
                habit,
                today
            )
        )
        .length;
}

function getTotalToday() {
    return getTodaysHabits().length;
}

/* ==========================================
   HABIT QUERY HELPERS
   ========================================== */

function getActiveHabits() {
    return appState.habits.filter(
        habit =>
            habit.isActive &&
            !habit.isArchived
    );
}

function getArchivedHabits() {
    return appState.habits.filter(
        habit =>
            habit.isArchived
    );
}

function getHabitStatistics() {

    const active =
        getActiveHabits().length;

    const archived =
        getArchivedHabits().length;

    const total =
        appState.habits.length;

    return {
        total,
        active,
        archived
    };
}