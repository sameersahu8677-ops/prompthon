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

/* =========================================================
   PART 3 — CALCULATIONS
   STATUS ENGINE
   HEALTH SCORE
   QUICK INSIGHTS
   ========================================================= */

/* =========================================================
   NUTRITION CALCULATIONS
   ========================================================= */

function calculateCaloriesConsumed(log) {
    if (!log?.nutrition?.meals?.length) {
        return 0;
    }

    return log.nutrition.meals.reduce(
        (total, meal) =>
            total +
            safeParseNumber(
                meal.calories,
                0
            ),
        0
    );
}

function calculateCaloriesRemaining(log) {
    const settings = getSettings();

    return Math.max(
        settings.calorieGoal -
        calculateCaloriesConsumed(log),
        0
    );
}

/* =========================================================
   WORKOUT CALCULATIONS
   ========================================================= */

function calculateWorkoutMinutes(log) {
    if (!log?.workouts?.length) {
        return 0;
    }

    return log.workouts.reduce(
        (total, workout) =>
            total +
            safeParseNumber(
                workout.duration,
                0
            ),
        0
    );
}

function calculateWorkoutCalories(log) {
    if (!log?.workouts?.length) {
        return 0;
    }

    return log.workouts.reduce(
        (total, workout) =>
            total +
            safeParseNumber(
                workout.caloriesBurned,
                0
            ),
        0
    );
}

/* =========================================================
   STATUS ENGINE
   ========================================================= */

function calculateActivityStatus(log) {
    const steps =
        log?.activity?.steps || 0;

    if (steps >= 8000) {
        return "green";
    }

    if (steps >= 5000) {
        return "amber";
    }

    return "red";
}

function calculateWaterStatus(log) {
    const settings = getSettings();

    const glasses =
        log?.water?.glasses || 0;

    const percentage =
        settings.waterGoal > 0
            ? (glasses /
                settings.waterGoal) *
            100
            : 0;

    if (percentage >= 100) {
        return "green";
    }

    if (percentage >= 75) {
        return "amber";
    }

    return "red";
}

function calculateSleepStatus(log) {
    const hours =
        log?.sleep?.hours || 0;

    if (hours >= 7) {
        return "green";
    }

    if (hours >= 6) {
        return "amber";
    }

    return "red";
}

function calculateNutritionStatus(log) {
    const settings = getSettings();

    const consumed =
        calculateCaloriesConsumed(log);

    if (
        settings.calorieGoal <= 0
    ) {
        return "red";
    }

    const percentage =
        (consumed /
            settings.calorieGoal) *
        100;

    if (
        percentage >= 90 &&
        percentage <= 110
    ) {
        return "green";
    }

    if (
        (percentage >= 70 &&
            percentage < 90) ||
        (percentage > 110 &&
            percentage <= 120)
    ) {
        return "amber";
    }

    return "red";
}

/* =========================================================
   HEALTH SCORE
   ========================================================= */

function calculateHealthScore(
    log,
    settings = getSettings()
) {
    let score = 0;

    /* Activity (20) */

    const stepRatio =
        Math.min(
            (log.activity.steps || 0) /
            settings.stepGoal,
            1
        ) * 20;

    score += stepRatio;

    /* Water (20) */

    const waterRatio =
        Math.min(
            (log.water.glasses || 0) /
            settings.waterGoal,
            1
        ) * 20;

    score += waterRatio;

    /* Sleep (20) */

    const sleepRatio =
        Math.min(
            (log.sleep.hours || 0) /
            8,
            1
        ) * 20;

    score += sleepRatio;

    /* Nutrition (20) */

    const calories =
        calculateCaloriesConsumed(log);

    const calorieDifference =
        Math.abs(
            calories -
            settings.calorieGoal
        );

    const nutritionScore =
        Math.max(
            20 -
            (calorieDifference /
                settings.calorieGoal) *
            20,
            0
        );

    score += nutritionScore;

    /* Workout (20) */

    const workoutScore =
        log.workouts.length > 0
            ? 20
            : 0;

    score += workoutScore;

    score = Math.round(score);

    let label =
        "Needs Attention";

    if (score >= 90) {
        label = "Excellent";
    } else if (score >= 75) {
        label = "Good";
    } else if (score >= 50) {
        label = "Fair";
    }

    return {
        score,
        label
    };
}

/* =========================================================
   QUICK INSIGHT ENGINE
   ========================================================= */

function generateQuickInsight(
    log,
    settings = getSettings()
) {
    const steps =
        log?.activity?.steps || 0;

    const water =
        log?.water?.glasses || 0;

    const sleep =
        log?.sleep?.hours || 0;

    const calories =
        calculateCaloriesConsumed(log);

    /* Water Goal */

    if (
        water >=
        settings.waterGoal
    ) {
        return "🎉 Great job! You've reached your water goal today.";
    }

    /* Sleep Warning */

    if (sleep > 0 && sleep < 6) {
        return "😴 Rest Needed. Try to get more sleep tonight.";
    }

    /* Near Step Goal */

    const stepGap =
        settings.stepGoal -
        steps;

    if (
        stepGap > 0 &&
        stepGap <= 1500
    ) {
        return `🚶 You're only ${stepGap.toLocaleString()} steps away from today's goal.`;
    }

    /* Calorie Goal Achieved */

    const caloriePercent =
        settings.calorieGoal > 0
            ? (calories /
                settings.calorieGoal) *
            100
            : 0;

    if (
        caloriePercent >= 90 &&
        caloriePercent <= 110
    ) {
        return "✅ Your nutrition is on track today.";
    }

    /* Workout Bonus */

    if (
        log.workouts &&
        log.workouts.length > 0
    ) {
        return "💪 Nice work! You've completed a workout today.";
    }

    return "🌟 Keep tracking your health habits to build consistency.";
}

/* =========================================================
   PART 4 — TRENDS
   ALERTS
   TIMELINE RETRIEVAL
   EXPORT ENGINE
   ========================================================= */

/* =========================================================
   DATE RANGE HELPERS
   ========================================================= */

function getPreviousDate(dateKey, daysBack = 1) {
    const date = new Date(dateKey);
    date.setDate(date.getDate() - daysBack);

    return formatDateKey(date);
}

function getLast7DaysData(
    referenceDate = getTodayDate()
) {
    const result = [];

    for (let i = 6; i >= 0; i--) {
        const dateKey =
            getPreviousDate(
                referenceDate,
                i
            );

        const log =
            healthTrackerData.logs[
            dateKey
            ];

        if (log) {
            result.push({
                date: dateKey,
                log
            });
        }
    }

    return result;
}

/* =========================================================
   WEEKLY TREND ANALYSIS
   ========================================================= */

function calculateWeeklyTrends(
    referenceDate = getTodayDate()
) {
    const records =
        getLast7DaysData(
            referenceDate
        );

    if (records.length === 0) {
        return {
            averageSteps: 0,
            averageCalories: 0,
            averageSleep: 0,
            totalWorkouts: 0,
            daysTracked: 0
        };
    }

    let totalSteps = 0;
    let totalCalories = 0;
    let totalSleep = 0;
    let totalWorkouts = 0;

    records.forEach(record => {
        const log = record.log;

        totalSteps +=
            log.activity?.steps || 0;

        totalCalories +=
            calculateCaloriesConsumed(
                log
            );

        totalSleep +=
            log.sleep?.hours || 0;

        totalWorkouts +=
            log.workouts?.length || 0;
    });

    const daysTracked =
        records.length;

    return {
        averageSteps: Math.round(
            totalSteps / daysTracked
        ),

        averageCalories:
            Math.round(
                totalCalories /
                daysTracked
            ),

        averageSleep:
            Number(
                (
                    totalSleep /
                    daysTracked
                ).toFixed(1)
            ),

        totalWorkouts,

        daysTracked
    };
}

/* =========================================================
   ALERT ENGINE
   ========================================================= */

function checkLowActivityAlert(
    referenceDate = getTodayDate()
) {
    const lowActivityDays = [];

    for (
        let i = 0;
        i < CONFIG.LOW_ACTIVITY_DAYS;
        i++
    ) {
        const dateKey =
            getPreviousDate(
                referenceDate,
                i
            );

        const log =
            healthTrackerData.logs[
            dateKey
            ];

        if (!log) {
            return null;
        }

        const steps =
            log.activity?.steps || 0;

        if (
            steps >=
            CONFIG.STEP_ALERT_THRESHOLD
        ) {
            return null;
        }

        lowActivityDays.push(
            dateKey
        );
    }

    return {
        type: "warning",

        title:
            "Low Activity Alert",

        message:
            "You've been under your step goal for 3 days. Try a 20-minute walk today!",

        days: lowActivityDays
    };
}

/* =========================================================
   TIMELINE RETRIEVAL
   ========================================================= */

function getRecentTimelineEntries(
    limit = 10
) {
    const entries = [];

    Object.entries(
        healthTrackerData.logs
    ).forEach(
        ([dateKey, log]) => {
            if (
                !Array.isArray(
                    log.timeline
                )
            ) {
                return;
            }

            log.timeline.forEach(
                entry => {
                    entries.push({
                        ...entry,
                        date: dateKey
                    });
                }
            );
        }
    );

    entries.sort(
        (a, b) =>
            new Date(
                b.timestamp
            ) -
            new Date(
                a.timestamp
            )
    );

    return entries.slice(
        0,
        limit
    );
}

/* =========================================================
   EXPORT ENGINE
   ========================================================= */

function exportHealthData() {
    try {
        const json =
            JSON.stringify(
                healthTrackerData,
                null,
                2
            );

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            "health-tracker-data.json";

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(
            url
        );

        return true;

    } catch (error) {
        console.error(
            "Export failed:",
            error
        );

        return false;
    }
}

/* =========================================================
   RESET CONFIRMATION
   ========================================================= */

function confirmReset() {
    return window.confirm(
        "Are you sure you want to delete all health data? This action cannot be undone."
    );
}

/* =========================================================
   TREND DATA HELPERS
   ========================================================= */

function getTrendChartData(
    referenceDate = getTodayDate()
) {
    const records =
        getLast7DaysData(
            referenceDate
        );

    return records.map(
        record => ({
            date: record.date,

            steps:
                record.log.activity
                    ?.steps || 0,

            sleep:
                record.log.sleep
                    ?.hours || 0,

            calories:
                calculateCaloriesConsumed(
                    record.log
                )
        })
    );
}