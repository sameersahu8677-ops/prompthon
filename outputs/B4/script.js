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


/* =========================================================
   PART 2A
   BUSINESS LOGIC CORE
   VALIDATION SERVICE
   LOCK SERVICE
   SCORING SERVICE
========================================================= */


/* =========================================================
   VALIDATION SERVICE
========================================================= */

const ValidationService = {

    validateName(name) {

        const value =
            String(name || "").trim();

        if (!value) {

            return {
                success: false,
                message: "Candidate name is required."
            };
        }

        if (value.length < 2) {

            return {
                success: false,
                message:
                    "Candidate name must contain at least 2 characters."
            };
        }

        return {
            success: true,
            message: "Valid candidate name."
        };
    },

    validateRollNumber(
        rollNumber,
        ignoreCandidateId = null
    ) {

        const value =
            String(rollNumber || "").trim();

        if (!value) {

            return {
                success: false,
                message: "Roll number is required."
            };
        }

        const duplicate =
            ATSStore.candidates.find(
                candidate =>
                    candidate.rollNumber === value &&
                    candidate.id !== ignoreCandidateId
            );

        if (duplicate) {

            return {
                success: false,
                message:
                    "A candidate with this roll number already exists."
            };
        }

        return {
            success: true,
            message: "Valid roll number."
        };
    },

    validateRole(role) {

        const value =
            String(role || "").trim();

        if (!value) {

            return {
                success: false,
                message:
                    "Candidate role is required."
            };
        }

        return {
            success: true,
            message: "Valid role."
        };
    },

    validateStage(stage) {

        if (
            !Utils.isValidStage(stage)
        ) {

            return {
                success: false,
                message: "Invalid stage."
            };
        }

        return {
            success: true,
            message: "Valid stage."
        };
    },

    validateScore(score) {

        if (
            score === "" ||
            score === null ||
            score === undefined
        ) {

            return {
                success: false,
                message:
                    "Technical score is required."
            };
        }

        const numericScore =
            Number(score);

        if (
            Number.isNaN(numericScore)
        ) {

            return {
                success: false,
                message:
                    "Score must be numeric."
            };
        }

        if (
            numericScore < 0 ||
            numericScore > 100
        ) {

            return {
                success: false,
                message:
                    "Score must be between 0 and 100."
            };
        }

        return {
            success: true,
            message: "Valid score.",
            data: numericScore
        };
    },

    validateCandidatePayload(data) {

        const nameResult =
            this.validateName(data.name);

        if (!nameResult.success) {
            return nameResult;
        }

        const rollResult =
            this.validateRollNumber(
                data.rollNumber
            );

        if (!rollResult.success) {
            return rollResult;
        }

        const roleResult =
            this.validateRole(data.role);

        if (!roleResult.success) {
            return roleResult;
        }

        return {
            success: true,
            message:
                "Candidate payload valid."
        };
    }
};


/* =========================================================
   LOCK SERVICE
========================================================= */

const LockService = {

    lockCandidate(
        candidate,
        reason = "Candidate Locked"
    ) {

        if (!candidate) {

            return {
                success: false,
                message:
                    "Candidate not found."
            };
        }

        if (candidate.isLocked) {

            return {
                success: true,
                message:
                    "Candidate already locked.",
                data: candidate
            };
        }

        candidate.isLocked = true;

        candidate.updatedAt =
            Utils.createTimestamp();

        HistoryService.addHistoryEntry(
            candidate,
            reason
        );

        return {
            success: true,
            message:
                "Candidate locked successfully.",
            data: candidate
        };
    },

    isLocked(candidate) {

        return Boolean(
            candidate?.isLocked
        );
    },

    enforceLock(candidate) {

        if (!candidate) {

            return {
                success: false,
                message:
                    "Candidate not found."
            };
        }

        if (candidate.isLocked) {

            return {
                success: false,
                message:
                    "Candidate is permanently locked."
            };
        }

        return {
            success: true,
            message:
                "Candidate is editable."
        };
    },

    enforceRejectedInvariant(candidate) {

        if (!candidate) {
            return;
        }

        if (
            candidate.stage ===
            STAGES.REJECTED
        ) {

            candidate.isLocked = true;
        }
    }
};


/* =========================================================
   SCORING SERVICE
========================================================= */

const ScoringService = {

    validateScore(score) {

        return ValidationService
            .validateScore(score);
    },

    evaluateScore(score) {

        const validation =
            this.validateScore(score);

        if (!validation.success) {
            return validation;
        }

        const numericScore =
            validation.data;

        return {
            success: true,
            data: {
                score: numericScore,
                passed:
                    numericScore >= 70
            }
        };
    },

    submitTechnicalScore(
        candidate,
        score
    ) {

        if (!candidate) {

            return {
                success: false,
                message:
                    "Candidate not found."
            };
        }

        const lockCheck =
            LockService.enforceLock(
                candidate
            );

        if (!lockCheck.success) {
            return lockCheck;
        }

        if (
            candidate.stage !==
            STAGES.INTERVIEWING
        ) {

            return {
                success: false,
                message:
                    "Technical scores can only be submitted from Interviewing stage."
            };
        }

        const evaluation =
            this.evaluateScore(score);

        if (!evaluation.success) {
            return evaluation;
        }

        const {
            score: finalScore,
            passed
        } = evaluation.data;

        candidate.technicalScore =
            finalScore;

        candidate.updatedAt =
            Utils.createTimestamp();

        HistoryService.addHistoryEntry(
            candidate,
            `Technical Score Added: ${finalScore}`
        );

        /* =========================
           PASS
        ========================= */

        if (passed) {

            candidate.stage =
                STAGES.TECHNICAL_TEST;

            HistoryService.addHistoryEntry(
                candidate,
                "Moved To Technical Test"
            );

            return {
                success: true,
                message:
                    "Candidate passed technical evaluation.",
                data: {
                    candidate,
                    passed: true
                }
            };
        }

        /* =========================
           FAIL
           AUTO REJECT
           AUTO LOCK
        ========================= */

        candidate.stage =
            STAGES.REJECTED;

        HistoryService.addHistoryEntry(
            candidate,
            `Auto Rejected (Score ${finalScore})`
        );

        LockService.lockCandidate(
            candidate,
            "Locked Due To Rejection"
        );

        LockService
            .enforceRejectedInvariant(
                candidate
            );

        return {
            success: true,
            message:
                "Candidate automatically rejected.",
            data: {
                candidate,
                passed: false
            }
        };
    }
};