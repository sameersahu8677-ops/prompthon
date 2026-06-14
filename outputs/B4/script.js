/* =========================================================
   PART 1
   FOUNDATION LAYER
   CONSTANTS + STORE + DEMO DATA + UTILITIES
   + HISTORY SERVICE + STORAGE SERVICE
========================================================= */

/* =========================================================
   STAGE ENUM
========================================================= */

const STAGES = Object.freeze({
    APPLIED: "applied",
    INTERVIEWING: "interviewing",
    TECHNICAL_TEST: "technical-test",
    OFFERED: "offered",
    REJECTED: "rejected"
});

/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEYS = Object.freeze({
    ATS_DATA: "ATS_TRACKER_DATA"
});

/* =========================================================
   ATS STORE
========================================================= */

const ATSStore = {

    candidates: [],

    searchQuery: "",

    filters: {
        role: "all",
        stage: "all"
    },

    sortMode: "newest",

    selectedCandidateId: null,

    modalState: {
        activeModal: null
    }
};

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

const Utils = {

    generateId() {

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 9)
        );
    },

    formatDate(dateInput) {

        try {

            return new Date(dateInput).toLocaleString();

        } catch {

            return "Invalid Date";
        }
    },

    deepClone(data) {

        return structuredClone(data);
    },

    safeJsonParse(jsonString, fallback = null) {

        try {

            return JSON.parse(jsonString);

        } catch {

            return fallback;
        }
    },

    createTimestamp() {

        return new Date().toISOString();
    },

    isValidStage(stage) {

        return Object.values(STAGES).includes(stage);
    },

    normalizeString(value) {

        return String(value || "")
            .trim()
            .toLowerCase();
    }
};

/* =========================================================
   HISTORY SERVICE
========================================================= */

const HistoryService = {

    addHistoryEntry(candidate, action) {

        if (!candidate) return;

        if (!Array.isArray(candidate.activityHistory)) {
            candidate.activityHistory = [];
        }

        candidate.activityHistory.push({
            action,
            timestamp: Utils.createTimestamp()
        });
    },

    getHistory(candidate) {

        return candidate?.activityHistory || [];
    },

    clearHistory(candidate) {

        if (!candidate) return;

        candidate.activityHistory = [];
    }
};

/* =========================================================
   DEMO DATA
========================================================= */

const DemoData = [

    {
        id: Utils.generateId(),
        name: "Aarav Sharma",
        rollNumber: "CSE24011",
        role: "Frontend Developer",
        stage: STAGES.APPLIED,
        technicalScore: null,
        isLocked: false,
        createdAt: Utils.createTimestamp(),
        updatedAt: Utils.createTimestamp(),
        activityHistory: [
            {
                action: "Candidate Created",
                timestamp: Utils.createTimestamp()
            }
        ]
    },

    {
        id: Utils.generateId(),
        name: "Priya Verma",
        rollNumber: "CSE24012",
        role: "UI/UX Designer",
        stage: STAGES.INTERVIEWING,
        technicalScore: null,
        isLocked: false,
        createdAt: Utils.createTimestamp(),
        updatedAt: Utils.createTimestamp(),
        activityHistory: [
            {
                action: "Candidate Created",
                timestamp: Utils.createTimestamp()
            },
            {
                action: "Moved To Interviewing",
                timestamp: Utils.createTimestamp()
            }
        ]
    },

    {
        id: Utils.generateId(),
        name: "Rohan Gupta",
        rollNumber: "CSE24013",
        role: "Backend Developer",
        stage: STAGES.TECHNICAL_TEST,
        technicalScore: 82,
        isLocked: false,
        createdAt: Utils.createTimestamp(),
        updatedAt: Utils.createTimestamp(),
        activityHistory: [
            {
                action: "Technical Score Added: 82",
                timestamp: Utils.createTimestamp()
            }
        ]
    },

    {
        id: Utils.generateId(),
        name: "Neha Singh",
        rollNumber: "CSE24014",
        role: "Marketing",
        stage: STAGES.OFFERED,
        technicalScore: 88,
        isLocked: false,
        createdAt: Utils.createTimestamp(),
        updatedAt: Utils.createTimestamp(),
        activityHistory: [
            {
                action: "Moved To Offered",
                timestamp: Utils.createTimestamp()
            }
        ]
    },

    {
        id: Utils.generateId(),
        name: "Kunal Patel",
        rollNumber: "CSE24015",
        role: "Content Writer",
        stage: STAGES.REJECTED,
        technicalScore: 61,
        isLocked: true,
        createdAt: Utils.createTimestamp(),
        updatedAt: Utils.createTimestamp(),
        activityHistory: [
            {
                action: "Auto Rejected (Score 61)",
                timestamp: Utils.createTimestamp()
            }
        ]
    }
];

/* =========================================================
   STORAGE SERVICE
========================================================= */

const StorageService = {

    saveCandidates(candidates) {

        try {

            localStorage.setItem(
                STORAGE_KEYS.ATS_DATA,
                JSON.stringify(candidates)
            );

            return true;

        } catch (error) {

            console.error(
                "Failed to save ATS data:",
                error
            );

            return false;
        }
    },

    loadCandidates() {

        try {

            const rawData =
                localStorage.getItem(
                    STORAGE_KEYS.ATS_DATA
                );

            if (!rawData) {
                return null;
            }

            const parsed =
                Utils.safeJsonParse(rawData);

            if (!Array.isArray(parsed)) {
                return null;
            }

            return parsed;

        } catch (error) {

            console.error(
                "Failed to load ATS data:",
                error
            );

            return null;
        }
    },

    clearStorage() {

        try {

            localStorage.removeItem(
                STORAGE_KEYS.ATS_DATA
            );

            return true;

        } catch (error) {

            console.error(
                "Failed to clear storage:",
                error
            );

            return false;
        }
    },

    seedIfEmpty() {

        const existingData =
            this.loadCandidates();

        if (
            existingData &&
            existingData.length > 0
        ) {
            return existingData;
        }

        const seedData =
            Utils.deepClone(DemoData);

        this.saveCandidates(seedData);

        return seedData;
    }
};