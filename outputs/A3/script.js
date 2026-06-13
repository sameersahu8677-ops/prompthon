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

            lastOpenedDate:
                getTodayDate(),

            lastDailyCheckDate:
                null,

            lastStreakEvaluationDate:
                null
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

        trackingStartDate:
            getTodayDate(),

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
        throw new Error(
            "Habit not found."
        );
    }

    appState.habits.splice(
        habitIndex,
        1
    );

    StorageService.saveState(
        appState
    );

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

/* ==========================================
   PART 3 - XP & LEVEL ENGINE
   ========================================== */

/* ==========================================
   XP HELPERS
   ========================================== */

function getHabitXP(habit) {

    if (!habit) {
        return 0;
    }

    return habit.xpReward ||
        XP_REWARDS[habit.difficulty] ||
        0;
}

function getCompletionEntry(
    habit,
    date
) {

    if (!habit?.completionHistory) {
        return null;
    }

    return (
        habit.completionHistory[date] ||
        null
    );
}

/* ==========================================
   XP AWARDING
   ========================================== */

function awardXP(
    habitId,
    date = getTodayDate()
) {

    const habit =
        findHabitById(habitId);

    if (!habit) {
        throw new Error(
            "Habit not found."
        );
    }

    const completion =
        getCompletionEntry(
            habit,
            date
        );

    if (
        !completion ||
        !completion.completed
    ) {
        return false;
    }

    if (completion.xpAwarded) {
        return false;
    }

    const xp =
        getHabitXP(habit);

    appState.player.totalXP += xp;

    completion.xpAwarded = true;
    completion.xpAwardedAt =
        new Date().toISOString();

    StorageService.saveState(appState);

    return {
        success: true,
        xpAwarded: xp,
        totalXP:
            appState.player.totalXP
    };
}

function removeXP(
    habitId,
    date = getTodayDate()
) {

    const habit =
        findHabitById(habitId);

    if (!habit) {
        throw new Error(
            "Habit not found."
        );
    }

    const completion =
        getCompletionEntry(
            habit,
            date
        );

    if (
        !completion ||
        !completion.xpAwarded
    ) {
        return false;
    }

    const xp =
        getHabitXP(habit);

    appState.player.totalXP =
        Math.max(
            0,
            appState.player.totalXP - xp
        );

    completion.xpAwarded = false;
    completion.xpRemovedAt =
        new Date().toISOString();

    StorageService.saveState(appState);

    return {
        success: true,
        xpRemoved: xp,
        totalXP:
            appState.player.totalXP
    };
}

/* ==========================================
   LEVEL CALCULATIONS
   ========================================== */

function calculateLevel(
    totalXP =
        appState.player.totalXP
) {

    return (
        Math.floor(
            totalXP /
            LEVEL_CONFIG.XP_PER_LEVEL
        ) + 1
    );
}

function getCurrentLevelXP() {

    const level =
        calculateLevel();

    return (
        (level - 1) *
        LEVEL_CONFIG.XP_PER_LEVEL
    );
}

function getNextLevelXP() {

    const level =
        calculateLevel();

    return (
        level *
        LEVEL_CONFIG.XP_PER_LEVEL
    );
}

function getXPIntoCurrentLevel() {

    return (
        appState.player.totalXP -
        getCurrentLevelXP()
    );
}

function getXPNeededForNextLevel() {

    return (
        getNextLevelXP() -
        appState.player.totalXP
    );
}

/* ==========================================
   LEVEL PROGRESS
   ========================================== */

function getLevelProgressPercent() {

    const currentLevelXP =
        getCurrentLevelXP();

    const nextLevelXP =
        getNextLevelXP();

    const xpRange =
        nextLevelXP -
        currentLevelXP;

    const progressXP =
        appState.player.totalXP -
        currentLevelXP;

    if (xpRange <= 0) {
        return 100;
    }

    return Math.min(
        100,
        Math.max(
            0,
            Math.round(
                (
                    progressXP /
                    xpRange
                ) * 100
            )
        )
    );
}

function getLevelProgressData() {

    return {
        currentLevel:
            calculateLevel(),

        totalXP:
            appState.player.totalXP,

        currentLevelXP:
            getCurrentLevelXP(),

        nextLevelXP:
            getNextLevelXP(),

        xpIntoCurrentLevel:
            getXPIntoCurrentLevel(),

        xpNeeded:
            getXPNeededForNextLevel(),

        progressPercent:
            getLevelProgressPercent()
    };
}

/* ==========================================
   LEVEL-UP DETECTION
   ========================================== */

function detectLevelUp() {

    const previousLevel =
        appState.player.level;

    const calculatedLevel =
        calculateLevel();

    if (
        calculatedLevel <=
        previousLevel
    ) {
        return null;
    }

    appState.player.level =
        calculatedLevel;

    StorageService.saveState(
        appState
    );

    return {
        leveledUp: true,

        previousLevel,

        newLevel:
            calculatedLevel
    };
}

function syncPlayerLevel() {

    const calculatedLevel =
        calculateLevel();

    appState.player.level =
        calculatedLevel;

    StorageService.saveState(
        appState
    );

    return calculatedLevel;
}

/* ==========================================
   XP PROCESSING PIPELINE
   ========================================== */

function processHabitCompletionXP(
    habitId,
    date = getTodayDate()
) {

    const xpResult =
        awardXP(
            habitId,
            date
        );

    if (!xpResult) {
        return null;
    }

    const levelResult =
        detectLevelUp();

    return {
        xpResult,
        levelResult
    };
}

function processHabitUncompletionXP(
    habitId,
    date = getTodayDate()
) {

    const xpResult =
        removeXP(
            habitId,
            date
        );

    syncPlayerLevel();

    return xpResult;
}

/* ==========================================
   XP QUERY HELPERS
   ========================================== */

function getTotalXP() {
    return appState.player.totalXP;
}

function getCurrentLevel() {
    return appState.player.level;
}

function hasReachedXP(
    targetXP
) {

    return (
        appState.player.totalXP >=
        targetXP
    );
}

/* ==========================================
   PART 4 - STREAK & HP ENGINE
   ========================================== */

/* ==========================================
   DATE HELPERS
   ========================================== */

function getPreviousDate(dateString) {

    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDateRange(
    startDate,
    endDate
) {

    const dates = [];

    const current =
        new Date(startDate);

    const end =
        new Date(endDate);

    while (current <= end) {

        const year =
            current.getFullYear();

        const month =
            String(
                current.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                current.getDate()
            ).padStart(2, "0");

        dates.push(
            `${year}-${month}-${day}`
        );

        current.setDate(
            current.getDate() + 1
        );
    }

    return dates;
}

/* ==========================================
   ELIGIBLE HABITS
   ========================================== */

function getEligibleHabitsForDate(
    date
) {

    return appState.habits.filter(
        habit => {

            if (
                !habit.isActive ||
                habit.isArchived
            ) {
                return false;
            }

            return (
                habit.trackingStartDate <=
                date
            );
        }
    );
}

function isHabitEligibleForDate(
    habit,
    date
) {

    return (
        habit.trackingStartDate <= date
    );
}
/* ==========================================
   SUCCESSFUL DAY LOGIC
   ========================================== */

function isSuccessfulDay(
    date
) {

    const eligibleHabits =
        getEligibleHabitsForDate(
            date
        );

    if (
        eligibleHabits.length === 0
    ) {
        return false;
    }

    return eligibleHabits.every(
        habit =>
            isHabitCompletedOnDate(
                habit,
                date
            )
    );
}

/* ==========================================
   STREAK CALCULATION
   ========================================== */

function calculateCurrentStreak() {

    const today = getTodayDate();

    let streak = 0;

    let currentDate = today;

    if (!isSuccessfulDay(today)) {
        currentDate =
            getPreviousDate(today);
    }

    while (
        isSuccessfulDay(currentDate)
    ) {

        streak++;

        currentDate =
            getPreviousDate(currentDate);
    }

    return streak;
}

function updateCurrentStreak() {

    const streak =
        calculateCurrentStreak();

    appState.player.currentStreak =
        streak;

    StorageService.saveState(
        appState
    );

    return streak;
}

function updateLongestStreak() {

    const current =
        appState.player
            .currentStreak;

    if (
        current >
        appState.player
            .longestStreak
    ) {

        appState.player
            .longestStreak =
            current;
    }

    StorageService.saveState(
        appState
    );
    return appState.player
        .longestStreak;
}

/* ==========================================
   HP HELPERS
   ========================================== */

function loseHP(
    amount = 1
) {

    const oldHP =
        appState.player.hp;

    appState.player.hp =
        Math.max(
            HP_CONFIG.MIN_HP,
            oldHP - amount
        );

    StorageService.saveState(
        appState
    );

    return {
        oldHP,
        newHP:
            appState.player.hp
    };
}

function restoreHP(
    amount = 1
) {

    const oldHP =
        appState.player.hp;

    appState.player.hp =
        Math.min(
            HP_CONFIG.MAX_HP,
            oldHP + amount
        );
    StorageService.saveState(
        appState
    );
    return {
        oldHP,
        newHP:
            appState.player.hp
    };
}

/* ==========================================
   HP RECOVERY SYSTEM
   ========================================== */

function processHPRecovery() {

    const streak =
        appState.player
            .currentStreak;

    const milestone =
        Math.floor(
            streak / 7
        );

    const lastRewarded =
        appState.player
            .lastHPRewardStreakMilestone;

    if (
        milestone <= 0 ||
        milestone <=
        lastRewarded
    ) {
        return null;
    }

    const hpResult =
        restoreHP(1);

    appState.player
        .lastHPRewardStreakMilestone =
        milestone;

    return {
        restored: true,
        milestone,
        hpResult
    };
}

/* ==========================================
   MISS TRACKING
   ========================================== */

function evaluateHabitMisses(
    habit,
    evaluationDate
) {

    const previousDay =
        getPreviousDate(
            evaluationDate
        );

    if (
        !isHabitEligibleForDate(
            habit,
            previousDay
        )
    ) {

        return {
            penaltyTriggered: false
        };
    }

    const currentMiss =
        !isHabitCompletedOnDate(
            habit,
            evaluationDate
        );

    const previousMiss =
        !isHabitCompletedOnDate(
            habit,
            previousDay
        );

    if (
        currentMiss &&
        previousMiss
    ) {

        habit.missTracking
            .consecutiveMisses += 1;

        if (
            !habit.missTracking
                .penaltyApplied
        ) {

            habit.missTracking
                .penaltyApplied =
                true;

            return {
                penaltyTriggered: true
            };
        }

        return {
            penaltyTriggered: false
        };
    }

    if (
        isHabitCompletedOnDate(
            habit,
            evaluationDate
        )
    ) {

        habit.missTracking
            .consecutiveMisses = 0;

        habit.missTracking
            .penaltyApplied =
            false;
    }

    return {
        penaltyTriggered: false
    };
}

/* ==========================================
   HP PENALTY SYSTEM
   ========================================== */

function processHPPenalties(
    evaluationDate
) {

    const habits =
        getEligibleHabitsForDate(
            evaluationDate
        );

    let penaltyCount = 0;

    for (
        const habit of habits
    ) {

        const result =
            evaluateHabitMisses(
                habit,
                evaluationDate
            );

        if (
            result.penaltyTriggered
        ) {

            loseHP(1);

            appState.player
                .currentStreak = 0;

            penaltyCount++;
        }
    }

    return {
        penaltiesApplied:
            penaltyCount
    };
}

/* ==========================================
   DAILY EVALUATION
   ========================================== */

function evaluateDay(
    date
) {

    const successful =
        isSuccessfulDay(
            date
        );

    if (
        successful
    ) {

        updateCurrentStreak();

        updateLongestStreak();

        processHPRecovery();

    } else {

        processHPPenalties(
            date
        );
    }

    return {
        date,
        successful,
        streak:
            appState.player
                .currentStreak,
        hp:
            appState.player.hp
    };
}

/* ==========================================
   DAILY MAINTENANCE
   ========================================== */

function runDailyChecks() {

    const today =
        getTodayDate();

    const lastCheck =
        appState.appMeta
            .lastDailyCheckDate;

    if (
        lastCheck === today
    ) {

        return false;
    }

    if (
        !lastCheck
    ) {

        appState.appMeta
            .lastDailyCheckDate =
            today;

        StorageService.saveState(
            appState
        );

        return true;
    }

    const datesToEvaluate =
        getDateRange(
            lastCheck,
            today
        );

    datesToEvaluate.shift();

    for (
        const date of datesToEvaluate
    ) {

        evaluateDay(
            date
        );
    }

    appState.appMeta
        .lastDailyCheckDate =
        today;

    StorageService.saveState(
        appState
    );

    return true;
}

/* ==========================================
   STREAK QUERY HELPERS
   ========================================== */

function getCurrentStreak() {

    return appState.player
        .currentStreak;
}

function getLongestStreak() {

    return appState.player
        .longestStreak;
}

function getCurrentHP() {

    return appState.player.hp;
}

/* ==========================================
   PART 5 - ACHIEVEMENTS & ACTIVITY FEED
   ========================================== */

/* ==========================================
   ACTIVITY CONFIG
   ========================================== */

const ACTIVITY_CONFIG = Object.freeze({
    MAX_ENTRIES: 100
});

const ACHIEVEMENT_IDS = Object.freeze({
    FIRST_HABIT: "first_habit_completed",
    FIRST_LEVEL_UP: "first_level_up",
    STREAK_7: "streak_7",
    STREAK_30: "streak_30",
    XP_100: "xp_100",
    XP_500: "xp_500"
});

/* ==========================================
   ACHIEVEMENT DEFINITIONS
   ========================================== */

const ACHIEVEMENTS = Object.freeze({

    [ACHIEVEMENT_IDS.FIRST_HABIT]: {
        id: ACHIEVEMENT_IDS.FIRST_HABIT,
        title: "First Quest",
        description: "Complete your first habit."
    },

    [ACHIEVEMENT_IDS.FIRST_LEVEL_UP]: {
        id: ACHIEVEMENT_IDS.FIRST_LEVEL_UP,
        title: "Rising Adventurer",
        description: "Reach Level 2."
    },

    [ACHIEVEMENT_IDS.STREAK_7]: {
        id: ACHIEVEMENT_IDS.STREAK_7,
        title: "Streak Warrior",
        description: "Maintain a 7-day streak."
    },

    [ACHIEVEMENT_IDS.STREAK_30]: {
        id: ACHIEVEMENT_IDS.STREAK_30,
        title: "Legendary Consistency",
        description: "Maintain a 30-day streak."
    },

    [ACHIEVEMENT_IDS.XP_100]: {
        id: ACHIEVEMENT_IDS.XP_100,
        title: "Century Club",
        description: "Earn 100 total XP."
    },

    [ACHIEVEMENT_IDS.XP_500]: {
        id: ACHIEVEMENT_IDS.XP_500,
        title: "XP Master",
        description: "Earn 500 total XP."
    }
});

/* ==========================================
   ACTIVITY FEED ENGINE
   ========================================== */

function addActivity(
    type,
    title,
    description = ""
) {

    const activity = {
        id: `activity_${Date.now()}`,
        type,
        title,
        description,

        timestamp:
            new Date().toISOString()
    };

    appState.activityFeed.unshift(
        activity
    );

    if (
        appState.activityFeed.length >
        ACTIVITY_CONFIG.MAX_ENTRIES
    ) {

        appState.activityFeed =
            appState.activityFeed.slice(
                0,
                ACTIVITY_CONFIG.MAX_ENTRIES
            );
    }

    StorageService.saveState(
        appState
    );

    return activity;
}

function getRecentActivities(
    limit = 20
) {

    return appState.activityFeed
        .slice(0, limit);
}

/* ==========================================
   ACHIEVEMENT HELPERS
   ========================================== */

function isAchievementUnlocked(
    achievementId
) {

    return appState.achievements.some(
        achievement =>
            achievement.id ===
            achievementId
    );
}

function getUnlockedAchievements() {

    return appState.achievements;
}

function getAchievementById(
    achievementId
) {

    return (
        ACHIEVEMENTS[
        achievementId
        ] || null
    );
}

/* ==========================================
   ACHIEVEMENT UNLOCKING
   ========================================== */

function unlockAchievement(
    achievementId
) {

    if (
        isAchievementUnlocked(
            achievementId
        )
    ) {

        return null;
    }

    const definition =
        getAchievementById(
            achievementId
        );

    if (!definition) {

        throw new Error(
            "Achievement definition not found."
        );
    }

    const achievement = {
        id: definition.id,

        title: definition.title,

        description:
            definition.description,

        unlockedAt:
            new Date().toISOString()
    };

    appState.achievements.push(
        achievement
    );

    addActivity(
        "achievement",
        "Achievement Unlocked",
        definition.title
    );

    StorageService.saveState(
        appState
    );

    return achievement;
}

/* ==========================================
   ACHIEVEMENT CHECKERS
   ========================================== */

function checkFirstHabitAchievement() {

    const completedHabits =
        appState.habits.some(
            habit =>
                Object.values(
                    habit.completionHistory
                ).some(
                    entry =>
                        entry.completed
                )
        );

    if (
        completedHabits
    ) {

        unlockAchievement(
            ACHIEVEMENT_IDS.FIRST_HABIT
        );
    }
}

function checkLevelAchievements() {

    if (
        appState.player.level >= 2
    ) {

        unlockAchievement(
            ACHIEVEMENT_IDS.FIRST_LEVEL_UP
        );
    }
}

function checkStreakAchievements() {

    const streak =
        appState.player
            .currentStreak;

    if (
        streak >= 7
    ) {

        unlockAchievement(
            ACHIEVEMENT_IDS.STREAK_7
        );
    }

    if (
        streak >= 30
    ) {

        unlockAchievement(
            ACHIEVEMENT_IDS.STREAK_30
        );
    }
}

function checkXPAchievements() {

    const totalXP =
        appState.player.totalXP;

    if (
        totalXP >=
        ACHIEVEMENT_THRESHOLDS.XP_100
    ) {

        unlockAchievement(
            ACHIEVEMENT_IDS.XP_100
        );
    }

    if (
        totalXP >=
        ACHIEVEMENT_THRESHOLDS.XP_500
    ) {

        unlockAchievement(
            ACHIEVEMENT_IDS.XP_500
        );
    }
}

/* ==========================================
   MASTER ACHIEVEMENT CHECKER
   ========================================== */

function checkAchievements() {

    checkFirstHabitAchievement();

    checkLevelAchievements();

    checkStreakAchievements();

    checkXPAchievements();

    StorageService.saveState(
        appState
    );
}

/* ==========================================
   FEED EVENT HELPERS
   ========================================== */

function logHabitCompletion(
    habit
) {

    addActivity(
        "habit",
        "Quest Completed",
        `${habit.name} (+${habit.xpReward} XP)`
    );
}

function logLevelUp(
    oldLevel,
    newLevel
) {

    addActivity(
        "level",
        "Level Up!",
        `Level ${oldLevel} → Level ${newLevel}`
    );
}

function logHPLoss(
    oldHP,
    newHP
) {

    addActivity(
        "hp",
        "HP Lost",
        `${oldHP} → ${newHP}`
    );
}

function logHPRestore(
    oldHP,
    newHP
) {

    addActivity(
        "hp",
        "HP Restored",
        `${oldHP} → ${newHP}`
    );
}

function logXPGain(
    amount
) {

    addActivity(
        "xp",
        "XP Earned",
        `+${amount} XP`
    );
}

/* ==========================================
   ACHIEVEMENT STATISTICS
   ========================================== */

function getAchievementStatistics() {

    const unlocked =
        appState.achievements.length;

    const total =
        Object.keys(
            ACHIEVEMENTS
        ).length;

    return {
        unlocked,
        total,
        completionPercent:
            Math.round(
                (unlocked / total) * 100
            )
    };
}

/* ==========================================
   PART 6A - RENDERING ENGINE
   ========================================== */

/* ==========================================
   DOM CACHE
   ========================================== */

const DOM = {};

function cacheDOMElements() {

    DOM.levelDisplay =
        document.getElementById(
            "level-display"
        );

    DOM.xpDisplay =
        document.getElementById(
            "xp-display"
        );

    DOM.hpDisplay =
        document.getElementById(
            "hp-display"
        );

    DOM.streakDisplay =
        document.getElementById(
            "streak-display"
        );

    DOM.longestStreakDisplay =
        document.getElementById(
            "longest-streak-display"
        );

    DOM.xpProgressFill =
        document.getElementById(
            "xp-progress-fill"
        );

    DOM.xpProgressText =
        document.getElementById(
            "xp-progress-text"
        );

    DOM.completedToday =
        document.getElementById(
            "completed-today"
        );

    DOM.totalToday =
        document.getElementById(
            "total-habits-today"
        );

    DOM.habitList =
        document.getElementById(
            "habit-list"
        );

    DOM.activityFeed =
        document.getElementById(
            "activity-feed"
        );

    DOM.achievementsContainer =
        document.getElementById(
            "achievements-container"
        );

    DOM.emptyState =
        document.getElementById(
            "empty-state"
        );

    DOM.motivationMessage =
        document.getElementById(
            "motivation-message"
        );
}

/* ==========================================
   DASHBOARD RENDERING
   ========================================== */

function renderDashboard() {

    if (
        !DOM.levelDisplay
    ) {
        return;
    }

    DOM.levelDisplay.textContent =
        appState.player.level;

    DOM.xpDisplay.textContent =
        appState.player.totalXP;

    DOM.streakDisplay.textContent =
        appState.player.currentStreak;

    DOM.longestStreakDisplay.textContent =
        appState.player.longestStreak;

    renderHPHearts();
}

/* ==========================================
   HP HEARTS
   ========================================== */

function renderHPHearts() {

    if (
        !DOM.hpDisplay
    ) {
        return;
    }

    const hp =
        appState.player.hp;

    let heartsHTML =
        '<div class="hp-hearts">';

    for (
        let i = 1;
        i <= HP_CONFIG.MAX_HP;
        i++
    ) {

        heartsHTML += `
            <span
                class="hp-heart ${i <= hp
                ? ""
                : "empty"
            }"
            >
                ❤️
            </span>
        `;
    }

    heartsHTML += `
        </div>
        <div class="hp-count">
            HP ${hp}/${HP_CONFIG.MAX_HP}
        </div>
    `;

    DOM.hpDisplay.innerHTML =
        heartsHTML;
}

/* ==========================================
   XP PROGRESS
   ========================================== */

function renderProgress() {

    if (
        !DOM.xpProgressFill ||
        !DOM.xpProgressText
    ) {
        return;
    }

    const progress =
        getLevelProgressData();

    DOM.xpProgressFill.style.width =
        `${progress.progressPercent}%`;

    DOM.xpProgressText.textContent =
        `${progress.xpIntoCurrentLevel}/${LEVEL_CONFIG.XP_PER_LEVEL} XP • ${progress.xpNeeded} XP to next level`;
}

/* ==========================================
   HABIT CARD
   ========================================== */

function createHabitCard(
    habit
) {

    const today =
        getTodayDate();

    const completed =
        isHabitCompletedOnDate(
            habit,
            today
        );

    return `
        <article
            class="habit-card ${completed
            ? "completed"
            : ""
        }"
            data-habit-id="${habit.id}"
        >

            <div class="habit-header">

                <div class="habit-title-group">

                    <h3 class="habit-name">
                        ${habit.name}
                    </h3>

                    <div class="habit-meta">

                        <span class="
                            difficulty-badge
                            difficulty-${habit.difficulty}
                        ">
                            ${habit.difficulty}
                        </span>

                        <span class="xp-chip">
                            +${habit.xpReward} XP
                        </span>

                    </div>

                </div>

            </div>

            <div class="habit-footer">

                <div class="habit-completion">

                    <input
                        type="checkbox"
                        class="habit-checkbox"
                        data-habit-id="${habit.id}"
                        ${completed
            ? "checked"
            : ""
        }
                    >

                    <span class="completion-label">
                        Completed Today
                    </span>

                </div>

                <div class="habit-actions">

                    <button
                        class="habit-action-btn habit-edit-btn"
                        data-action="edit"
                        data-habit-id="${habit.id}"
                    >
                        ✏️
                    </button>

                    <button
                        class="habit-action-btn habit-archive-btn"
                        data-action="archive"
                        data-habit-id="${habit.id}"
                    >
                        📦
                    </button>

                    <button
                        class="habit-action-btn habit-delete-btn"
                        data-action="delete"
                        data-habit-id="${habit.id}"
                    >
                        🗑️
                    </button>

                </div>

            </div>

        </article>
    `;
}

/* ==========================================
   HABITS
   ========================================== */

function renderHabits() {

    if (
        !DOM.habitList
    ) {
        return;
    }

    const habits =
        getTodaysHabits();

    if (
        habits.length === 0
    ) {

        DOM.habitList.innerHTML =
            "";

        return;
    }

    DOM.habitList.innerHTML =
        habits
            .map(
                createHabitCard
            )
            .join("");

    if (
        DOM.completedToday
    ) {

        DOM.completedToday.textContent =
            getCompletedToday();
    }

    if (
        DOM.totalToday
    ) {

        DOM.totalToday.textContent =
            getTotalToday();
    }
}

/* ==========================================
   ACTIVITY FEED
   ========================================== */

function createActivityHTML(
    activity
) {

    let activityClass = "activity-success";

    if (
        activity.type === "xp" ||
        activity.type === "level" ||
        activity.type === "achievement"
    ) {
        activityClass = "activity-reward";
    }

    if (
        activity.type === "hp"
    ) {
        activityClass = "activity-hp";
    }

    return `
        <div
           class="activity-item ${activityClass}"
        >

            <div class="activity-content">

                <div class="activity-title">
                    ${activity.title}
                </div>

                <div class="activity-description">
                    ${activity.description}
                </div>

                <div class="activity-time">
                    ${new Date(
        activity.timestamp
    ).toLocaleString()}
                </div>

            </div>

        </div>
    `;
}

function renderActivityFeed() {

    if (
        !DOM.activityFeed
    ) {
        return;
    }

    const activities =
        getRecentActivities();

    if (
        activities.length === 0
    ) {

        DOM.activityFeed.innerHTML = `
            <div class="activity-empty">
                No activity yet.Your adventure has just begun.
Complete a quest to generate activity.v>
        `;

        return;
    }

    DOM.activityFeed.innerHTML =
        activities
            .map(
                createActivityHTML
            )
            .join("");
}

/* ==========================================
   ACHIEVEMENTS
   ========================================== */

function createAchievementCard(
    achievement
) {

    const unlocked =
        isAchievementUnlocked(
            achievement.id
        );

    return `
        <article
            class="
                achievement-card
                ${unlocked
            ? "unlocked"
            : "locked"
        }
            "
        >

            <div class="achievement-icon">
                ${unlocked
            ? "🏆"
            : "🔒"
        }
            </div>

            <h3 class="achievement-title">
                ${achievement.title}
            </h3>

            <p class="achievement-description">
                ${achievement.description}
            </p>

            ${unlocked
            ? `
                    <div class="achievement-date">
                        Unlocked
                    </div>
                    `
            : `
                    <div class="achievement-date">
                        Locked
                    </div>
                    `
        }

        </article>
    `;
}

function renderAchievements() {

    if (
        !DOM.achievementsContainer
    ) {
        return;
    }

    const allAchievements =
        Object.values(
            ACHIEVEMENTS
        );

    DOM.achievementsContainer.innerHTML =
        allAchievements
            .map(
                createAchievementCard
            )
            .join("");
}

/* ==========================================
   EMPTY STATE
   ========================================== */

function renderEmptyState() {

    if (
        !DOM.emptyState
    ) {
        return;
    }

    const hasHabits =
        getActiveHabits()
            .length > 0;

    DOM.emptyState.style.display =
        hasHabits
            ? "none"
            : "block";
}

/* ==========================================
   MOTIVATION MESSAGE
   ========================================== */

function renderMotivationMessage() {

    if (
        !DOM.motivationMessage
    ) {
        return;
    }

    const streak =
        appState.player
            .currentStreak;

    const level =
        appState.player.level;

    const progress =
        getLevelProgressData();

    let message =
        "Your adventure begins today.";

    if (
        streak >= 30
    ) {

        message =
            "Legendary consistency. Keep dominating.";

    } else if (
        streak >= 7
    ) {

        message =
            "Your streak is becoming powerful.";

    } else if (
        progress.xpNeeded <= 20
    ) {

        message =
            `Only ${progress.xpNeeded} XP until Level ${level + 1}!`;

    } else if (
        level >= 5
    ) {

        message =
            `Level ${level} adventurer. Keep climbing.`;
    }

    DOM.motivationMessage.textContent =
        message;
}

/* ==========================================
   MASTER RENDER
   ========================================== */

function renderApp() {

    renderDashboard();

    renderProgress();

    renderHabits();

    renderActivityFeed();

    renderAchievements();

    renderEmptyState();

    renderMotivationMessage();
}

/* ==========================================
   PART 6B - UI SYSTEMS
   ========================================== */

/* ==========================================
   EXTENDED DOM CACHE
   ========================================== */

function cacheUISystemElements() {

    DOM.toastContainer =
        document.getElementById(
            "toast-container"
        );

    DOM.habitModal =
        document.getElementById(
            "habit-modal"
        );

    DOM.habitForm =
        document.getElementById(
            "habit-form"
        );

    DOM.modalTitle =
        document.getElementById(
            "modal-title"
        );

    DOM.habitNameInput =
        document.getElementById(
            "habit-name"
        );

    DOM.habitDifficultyInput =
        document.getElementById(
            "habit-difficulty"
        );

    DOM.saveHabitBtn =
        document.getElementById(
            "save-habit-btn"
        );

    DOM.cancelHabitBtn =
        document.getElementById(
            "cancel-habit-btn"
        );

    DOM.addHabitBtn =
        document.getElementById(
            "add-habit-btn"
        );
}

/* ==========================================
   MODAL STATE
   ========================================== */

const modalState = {

    mode: "create",

    editingHabitId: null
};

/* ==========================================
   TOAST SYSTEM
   ========================================== */

const TOAST_CONFIG = Object.freeze({

    DEFAULT_DURATION: 3500,

    MAX_TOASTS: 4
});

function generateToastId() {

    return `toast_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
}

function removeToast(
    toastId
) {

    const toast =
        document.querySelector(
            `[data-toast-id="${toastId}"]`
        );

    if (!toast) {
        return;
    }

    toast.remove();
}

function showToast(
    title,
    message,
    type = "success",
    duration =
        TOAST_CONFIG.DEFAULT_DURATION
) {

    if (
        !DOM.toastContainer
    ) {
        return;
    }

    const existingToasts =
        DOM.toastContainer
            .querySelectorAll(
                ".toast"
            );

    if (
        existingToasts.length >=
        TOAST_CONFIG.MAX_TOASTS
    ) {

        existingToasts[0].remove();
    }

    const toastId =
        generateToastId();

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `toast toast-${type}`;

    toast.dataset.toastId =
        toastId;

    toast.innerHTML = `
        <div class="toast-title">
            ${title}
        </div>

        <div class="toast-message">
            ${message}
        </div>
    `;

    DOM.toastContainer.appendChild(
        toast
    );

    setTimeout(
        () =>
            removeToast(
                toastId
            ),
        duration
    );

    return toastId;
}

/* ==========================================
   SPECIALIZED TOASTS
   ========================================== */

function showXPGainToast(
    xp
) {

    showToast(
        "XP Earned",
        `+${xp} XP gained`,
        "reward"
    );
}

function showLevelUpToast(
    level
) {

    showToast(
        "Level Up!",
        `You reached Level ${level}`,
        "reward",
        5000
    );
}

function showHPLossToast(
    hp
) {

    showToast(
        "HP Lost",
        `Current HP: ${hp}`,
        "hp"
    );
}

function showHPRestoreToast(
    hp
) {

    showToast(
        "HP Restored",
        `Current HP: ${hp}`,
        "success"
    );
}

function showAchievementToast(
    achievement
) {

    showToast(
        "Achievement Unlocked",
        achievement.title,
        "reward",
        5000
    );
}

/* ==========================================
   MODAL SYSTEM
   ========================================== */

function resetHabitForm() {

    if (
        DOM.habitForm
    ) {

        DOM.habitForm.reset();
    }

    modalState.mode =
        "create";

    modalState.editingHabitId =
        null;
}

function openHabitModal() {

    if (
        !DOM.habitModal
    ) {
        return;
    }

    DOM.habitModal.showModal();
}

function closeHabitModal() {

    if (
        !DOM.habitModal
    ) {
        return;
    }

    DOM.habitModal.close();

    resetHabitForm();
}

function openCreateHabitModal() {

    resetHabitForm();

    modalState.mode =
        "create";

    if (
        DOM.modalTitle
    ) {

        DOM.modalTitle.textContent =
            "Create New Quest";
    }

    openHabitModal();
}

function openEditHabitModal(
    habitId
) {

    const habit =
        findHabitById(
            habitId
        );

    if (!habit) {

        throw new Error(
            "Habit not found."
        );
    }

    modalState.mode =
        "edit";

    modalState.editingHabitId =
        habitId;

    if (
        DOM.modalTitle
    ) {

        DOM.modalTitle.textContent =
            "Edit Quest";
    }

    if (
        DOM.habitNameInput
    ) {

        DOM.habitNameInput.value =
            habit.name;
    }

    if (
        DOM.habitDifficultyInput
    ) {

        DOM.habitDifficultyInput.value =
            habit.difficulty;
    }

    openHabitModal();
}

/* ==========================================
   FORM VALIDATION
   ========================================== */

function validateHabitForm() {

    const name =
        DOM.habitNameInput
            ?.value
            ?.trim();

    const difficulty =
        DOM.habitDifficultyInput
            ?.value;

    if (
        !validateHabitName(
            name
        )
    ) {

        throw new Error(
            "Please enter a valid habit name."
        );
    }

    if (
        !validateDifficulty(
            difficulty
        )
    ) {

        throw new Error(
            "Please select a valid difficulty."
        );
    }

    return {
        name,
        difficulty
    };
}

/* ==========================================
   FORM SUBMISSION
   ========================================== */

function submitHabitForm() {

    const formData =
        validateHabitForm();

    if (
        modalState.mode ===
        "create"
    ) {

        const habit =
            createHabit(
                formData.name,
                formData.difficulty
            );

        addActivity(
            "habit",
            "Quest Created",
            habit.name
        );

        showToast(
            "Quest Created",
            habit.name,
            "success"
        );

    } else {

        updateHabit(
            modalState
                .editingHabitId,
            formData
        );

        showToast(
            "Quest Updated",
            formData.name,
            "success"
        );
    }

    closeHabitModal();

    renderApp();
}

/* ==========================================
   MODAL EVENT HELPERS
   ========================================== */

function handleModalCancel() {

    closeHabitModal();
}

function handleModalSubmit(
    event
) {

    event.preventDefault();

    try {

        submitHabitForm();

    } catch (error) {

        showToast(
            "Validation Error",
            error.message,
            "warning"
        );
    }
}

/* ==========================================
   UI SYSTEM INITIALIZER
   ========================================== */

function initializeUISystems() {

    cacheUISystemElements();

    if (
        DOM.addHabitBtn
    ) {

        DOM.addHabitBtn
            .addEventListener(
                "click",
                openCreateHabitModal
            );
    }

    if (
        DOM.cancelHabitBtn
    ) {

        DOM.cancelHabitBtn
            .addEventListener(
                "click",
                handleModalCancel
            );
    }

    if (
        DOM.habitForm
    ) {

        DOM.habitForm
            .addEventListener(
                "submit",
                handleModalSubmit
            );
    }
}

/* ==========================================
   PART 6C - INTEGRATION & STARTUP
   ========================================== */

/* ==========================================
   HEADER RENDERING
   ========================================== */

function renderHeaderLevel() {

    const headerLevel =
        document.getElementById(
            "header-level-display"
        );

    if (!headerLevel) {
        return;
    }

    headerLevel.textContent =
        appState.player.level;
}

/* ==========================================
   ENHANCED APP RENDER
   ========================================== */

const originalRenderApp =
    renderApp;

renderApp = function () {

    originalRenderApp();

    renderHeaderLevel();
};

/* ==========================================
   HABIT COMPLETION ORCHESTRATION
   ========================================== */

function handleHabitToggle(
    habitId
) {

    const habit =
        findHabitById(
            habitId
        );

    if (!habit) {
        return;
    }

    const today =
        getTodayDate();

    const wasCompleted =
        isHabitCompletedOnDate(
            habit,
            today
        );

    toggleHabitCompletion(
        habitId,
        today
    );

    if (!wasCompleted) {

        const result =
            processHabitCompletionXP(
                habitId,
                today
            );

        logHabitCompletion(
            habit
        );

        if (
            result?.xpResult
        ) {

            logXPGain(
                result.xpResult
                    .xpAwarded
            );

            showXPGainToast(
                result.xpResult
                    .xpAwarded
            );
        }

        if (
            result?.levelResult
        ) {

            logLevelUp(
                result.levelResult
                    .previousLevel,
                result.levelResult
                    .newLevel
            );

            showLevelUpToast(
                result.levelResult
                    .newLevel
            );
        }

    } else {

        processHabitUncompletionXP(
            habitId,
            today
        );
    }

    updateCurrentStreak();

    updateLongestStreak();

    processAchievementChanges();

    renderApp();
}

/* ==========================================
   ARCHIVE HANDLER
   ========================================== */

function handleArchiveHabit(
    habitId
) {

    const habit =
        findHabitById(
            habitId
        );

    if (!habit) {
        return;
    }

    archiveHabit(
        habitId
    );

    addActivity(
        "habit",
        "Quest Archived",
        habit.name
    );

    showToast(
        "Quest Archived",
        habit.name,
        "success"
    );

    renderApp();
}

/* ==========================================
   DELETE HANDLER
   ========================================== */

function handleDeleteHabit(
    habitId
) {

    const habit =
        findHabitById(
            habitId
        );

    if (!habit) {
        return;
    }

    const confirmed =
        confirm(
            `Delete "${habit.name}"?`
        );

    if (!confirmed) {
        return;
    }

    deleteHabit(
        habitId
    );

    addActivity(
        "habit",
        "Quest Deleted",
        habit.name
    );

    showToast(
        "Quest Deleted",
        habit.name,
        "warning"
    );

    renderApp();
}

/* ==========================================
   EDIT HANDLER
   ========================================== */

function handleEditHabit(
    habitId
) {

    openEditHabitModal(
        habitId
    );
}

/* ==========================================
   ACHIEVEMENT DETECTION WRAPPER
   ========================================== */

function processAchievementChanges() {

    const before =
        appState.achievements.length;

    checkAchievements();

    const after =
        appState.achievements.length;

    if (
        after <= before
    ) {
        return;
    }

    const newestAchievement =
        appState.achievements[
        after - 1
        ];

    showAchievementToast(
        newestAchievement
    );
}

/* ==========================================
   EVENT DELEGATION
   ========================================== */

function handleHabitListClick(
    event
) {

    const habitId =
        event.target.dataset
            .habitId;

    if (!habitId) {
        return;
    }

    if (
        event.target.classList.contains(
            "habit-checkbox"
        )
    ) {

        handleHabitToggle(
            habitId
        );

        return;
    }

    const action =
        event.target.dataset
            .action;

    switch (
    action
    ) {

        case "edit":

            handleEditHabit(
                habitId
            );

            break;

        case "archive":

            handleArchiveHabit(
                habitId
            );

            break;

        case "delete":

            handleDeleteHabit(
                habitId
            );

            break;
    }
}

/* ==========================================
   EVENT REGISTRATION
   ========================================== */

function registerEventListeners() {

    if (
        DOM.habitList
    ) {

        DOM.habitList
            .addEventListener(
                "click",
                handleHabitListClick
            );
    }
}

/* ==========================================
   DAILY SYSTEM INTEGRATION
   ========================================== */

function runIntegratedDailyChecks() {

    const oldHP =
        appState.player.hp;

    runDailyChecks();

    if (
        appState.player.hp >
        oldHP
    ) {

        logHPRestore(
            oldHP,
            appState.player.hp
        );

        showHPRestoreToast(
            appState.player.hp
        );
    }

    if (
        appState.player.hp <
        oldHP
    ) {

        logHPLoss(
            oldHP,
            appState.player.hp
        );

        showHPLossToast(
            appState.player.hp
        );
    }
}

/* ==========================================
   APPLICATION STARTUP
   ========================================== */

function startApplication() {

    try {

        initializeApp();

        cacheDOMElements();

        initializeUISystems();

        runIntegratedDailyChecks();

        processAchievementChanges();

        renderApp();

        registerEventListeners();

        console.info(
            "QuestForge started successfully."
        );

    } catch (error) {

        console.error(
            "Application startup failed:",
            error
        );

        showToast(
            "Startup Error",
            "Failed to initialize application.",
            "warning"
        );
    }
}

/* ==========================================
   BOOTSTRAP
   ========================================== */

document.addEventListener(
    "DOMContentLoaded",
    startApplication
);