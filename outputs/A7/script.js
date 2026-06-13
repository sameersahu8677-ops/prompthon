/* =========================================================
   PART 1 — FOUNDATION
   CONFIG
   STORAGE
   DATA FACTORY
   UTILS
   ========================================================= */

/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = Object.freeze({
    DEFAULT_STEP_GOAL: 8000,
    DEFAULT_CALORIE_GOAL: 2200,
    DEFAULT_WATER_GOAL: 8,

    STEP_ALERT_THRESHOLD: 5000,
    LOW_ACTIVITY_DAYS: 3,

    STORAGE_KEY: "healthTrackerData",
    VERSION: "1.0"
});

/* =========================================================
   DATA FACTORY
   ========================================================= */

function createEmptyDay() {
    return {
        activity: {
            steps: 0,
            activeMinutes: 0,
            distance: 0
        },

        nutrition: {
            meals: []
        },

        water: {
            glasses: 0
        },

        sleep: {
            hours: 0
        },

        workouts: [],

        timeline: []
    };
}

function createDefaultData() {
    return {
        version: CONFIG.VERSION,

        settings: {
            stepGoal: CONFIG.DEFAULT_STEP_GOAL,
            calorieGoal: CONFIG.DEFAULT_CALORIE_GOAL,
            waterGoal: CONFIG.DEFAULT_WATER_GOAL
        },

        logs: {}
    };
}

/* =========================================================
   VALIDATION HELPERS
   ========================================================= */

function isValidNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}

function safeParseNumber(value, fallback = 0) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : fallback;
}

function clampNumber(value, min, max) {
    return Math.min(
        Math.max(value, min),
        max
    );
}

/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatDateKey(date) {
    if (typeof date === "string") {
        return date;
    }

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTodayDate() {
    return formatDateKey(new Date());
}

/* =========================================================
   STRUCTURE VALIDATION
   ========================================================= */

function isValidDataStructure(data) {
    if (!data || typeof data !== "object") {
        return false;
    }

    if (
        typeof data.settings !== "object" ||
        typeof data.logs !== "object"
    ) {
        return false;
    }

    return true;
}

/* =========================================================
   STORAGE
   ========================================================= */

let healthTrackerData = createDefaultData();

function loadData() {
    try {
        const raw = localStorage.getItem(
            CONFIG.STORAGE_KEY
        );

        if (!raw) {
            healthTrackerData = createDefaultData();

            saveData();

            return healthTrackerData;
        }

        const parsed = JSON.parse(raw);

        if (!isValidDataStructure(parsed)) {
            throw new Error(
                "Invalid storage structure."
            );
        }

        healthTrackerData = {
            ...createDefaultData(),
            ...parsed
        };

        return healthTrackerData;

    } catch (error) {
        console.warn(
            "Storage recovery activated:",
            error
        );

        healthTrackerData = createDefaultData();

        saveData();

        return healthTrackerData;
    }
}

function saveData() {
    try {
        localStorage.setItem(
            CONFIG.STORAGE_KEY,
            JSON.stringify(healthTrackerData)
        );

        return true;

    } catch (error) {
        console.error(
            "Failed to save data:",
            error
        );

        return false;
    }
}

function resetDataStore() {
    healthTrackerData = createDefaultData();

    saveData();

    return healthTrackerData;
}

/* =========================================================
   LOG HELPERS
   ========================================================= */

function getOrCreateDayLog(date = getTodayDate()) {
    const dateKey = formatDateKey(date);

    if (!healthTrackerData.logs[dateKey]) {
        healthTrackerData.logs[dateKey] =
            createEmptyDay();

        saveData();
    }

    return healthTrackerData.logs[dateKey];
}

/* =========================================================
   GENERIC HELPERS
   ========================================================= */

function generateId(prefix = "item") {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

function deepClone(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function getSettings() {
    return deepClone(
        healthTrackerData.settings
    );
}
