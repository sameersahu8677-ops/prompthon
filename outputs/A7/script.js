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

/* =========================================================
   PART 2 — CORE FEATURE MODULES
   ACTIVITY
   NUTRITION
   WATER
   SLEEP
   WORKOUT
   SETTINGS
   TIMELINE
   ========================================================= */

/* =========================================================
   TIMELINE HELPERS
   ========================================================= */

function addTimelineEntry(
    date,
    action,
    details = ""
) {
    const log = getOrCreateDayLog(date);

    log.timeline.unshift({
        id: generateId("timeline"),
        action,
        details,
        timestamp: new Date().toISOString()
    });

    saveData();
}

function createTimelineMessage(
    action,
    details = ""
) {
    return {
        action,
        details
    };
}

/* =========================================================
   ACTIVITY MODULE
   ========================================================= */

function updateActivity(date, data = {}) {
    const log = getOrCreateDayLog(date);

    const steps = clampNumber(
        safeParseNumber(data.steps),
        0,
        100000
    );

    const activeMinutes = clampNumber(
        safeParseNumber(data.activeMinutes),
        0,
        1440
    );

    const distance = clampNumber(
        safeParseNumber(data.distance),
        0,
        100
    );

    log.activity = {
        steps,
        activeMinutes,
        distance
    };

    addTimelineEntry(
        date,
        "Activity Updated",
        `${steps} steps recorded`
    );

    saveData();

    return log.activity;
}

/* =========================================================
   NUTRITION MODULE
   ========================================================= */

function addMeal(date, meal = {}) {
    const log = getOrCreateDayLog(date);

    const mealName = String(
        meal.name || ""
    ).trim();

    const calories = clampNumber(
        safeParseNumber(meal.calories),
        0,
        10000
    );

    if (!mealName) {
        throw new Error(
            "Meal name is required."
        );
    }

    const newMeal = {
        id: generateId("meal"),
        name: mealName,
        calories
    };

    log.nutrition.meals.push(newMeal);

    addTimelineEntry(
        date,
        "Meal Added",
        `${mealName} (${calories} cal)`
    );

    saveData();

    return newMeal;
}

function removeMeal(date, mealId) {
    const log = getOrCreateDayLog(date);

    const index =
        log.nutrition.meals.findIndex(
            meal => meal.id === mealId
        );

    if (index === -1) {
        return false;
    }

    const removedMeal =
        log.nutrition.meals[index];

    log.nutrition.meals.splice(
        index,
        1
    );

    addTimelineEntry(
        date,
        "Meal Removed",
        removedMeal.name
    );

    saveData();

    return true;
}

/* =========================================================
   WATER MODULE
   ========================================================= */

function updateWater(date, glasses) {
    const log = getOrCreateDayLog(date);

    const waterValue = clampNumber(
        safeParseNumber(glasses),
        0,
        30
    );

    log.water.glasses = waterValue;

    addTimelineEntry(
        date,
        "Water Updated",
        `${waterValue} glasses`
    );

    saveData();

    return waterValue;
}

/* =========================================================
   SLEEP MODULE
   ========================================================= */

function updateSleep(date, hours) {
    const log = getOrCreateDayLog(date);

    const sleepHours = clampNumber(
        safeParseNumber(hours),
        0,
        24
    );

    log.sleep.hours = sleepHours;

    addTimelineEntry(
        date,
        "Sleep Updated",
        `${sleepHours} hours`
    );

    saveData();

    return sleepHours;
}

/* =========================================================
   WORKOUT MODULE
   ========================================================= */

function addWorkout(date, workout = {}) {
    const log = getOrCreateDayLog(date);

    const workoutType = String(
        workout.type || ""
    ).trim();

    const duration = clampNumber(
        safeParseNumber(workout.duration),
        1,
        600
    );

    const caloriesBurned = clampNumber(
        safeParseNumber(
            workout.caloriesBurned
        ),
        0,
        5000
    );

    if (!workoutType) {
        throw new Error(
            "Workout type is required."
        );
    }

    const newWorkout = {
        id: generateId("workout"),
        type: workoutType,
        duration,
        caloriesBurned
    };

    log.workouts.push(newWorkout);

    addTimelineEntry(
        date,
        "Workout Added",
        `${workoutType} (${duration} min)`
    );

    saveData();

    return newWorkout;
}

function removeWorkout(
    date,
    workoutId
) {
    const log = getOrCreateDayLog(date);

    const index =
        log.workouts.findIndex(
            workout =>
                workout.id === workoutId
        );

    if (index === -1) {
        return false;
    }

    const removedWorkout =
        log.workouts[index];

    log.workouts.splice(
        index,
        1
    );

    addTimelineEntry(
        date,
        "Workout Removed",
        removedWorkout.type
    );

    saveData();

    return true;
}

/* =========================================================
   SETTINGS MODULE
   ========================================================= */

function updateSettings(
    settings = {}
) {
    const current =
        healthTrackerData.settings;

    current.stepGoal = clampNumber(
        safeParseNumber(
            settings.stepGoal,
            current.stepGoal
        ),
        1000,
        100000
    );

    current.calorieGoal = clampNumber(
        safeParseNumber(
            settings.calorieGoal,
            current.calorieGoal
        ),
        500,
        10000
    );

    current.waterGoal = clampNumber(
        safeParseNumber(
            settings.waterGoal,
            current.waterGoal
        ),
        1,
        30
    );

    addTimelineEntry(
        getTodayDate(),
        "Goals Updated",
        "Personal goals changed"
    );

    saveData();

    return deepClone(current);
}

function getSettings() {
    return deepClone(
        healthTrackerData.settings
    );
}