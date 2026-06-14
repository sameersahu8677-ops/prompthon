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

/* =========================================================
   PART 2B
   CANDIDATE SERVICE
   TRANSITION SERVICE
   ANALYTICS SERVICE
========================================================= */


/* =========================================================
   CANDIDATE SERVICE
========================================================= */

const CandidateService = {

    createCandidate(data) {

        const validation =
            ValidationService.validateCandidatePayload(
                data
            );

        if (!validation.success) {
            return validation;
        }

        const candidate = {

            id: Utils.generateId(),

            name: data.name.trim(),

            rollNumber:
                data.rollNumber.trim(),

            role: data.role.trim(),

            stage: STAGES.APPLIED,

            technicalScore: null,

            isLocked: false,

            createdAt:
                Utils.createTimestamp(),

            updatedAt:
                Utils.createTimestamp(),

            activityHistory: []
        };

        HistoryService.addHistoryEntry(
            candidate,
            "Candidate Created"
        );

        ATSStore.candidates.push(candidate);

        return {
            success: true,
            message:
                "Candidate created successfully.",
            data: candidate
        };
    },

    updateCandidate(
        candidateId,
        updates
    ) {

        const candidate =
            this.getCandidate(candidateId);

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
            updates.name !== undefined
        ) {

            const validation =
                ValidationService.validateName(
                    updates.name
                );

            if (!validation.success) {
                return validation;
            }

            candidate.name =
                updates.name.trim();
        }

        if (
            updates.rollNumber !==
            undefined
        ) {

            const validation =
                ValidationService.validateRollNumber(
                    updates.rollNumber,
                    candidate.id
                );

            if (!validation.success) {
                return validation;
            }

            candidate.rollNumber =
                updates.rollNumber.trim();
        }

        if (
            updates.role !== undefined
        ) {

            const validation =
                ValidationService.validateRole(
                    updates.role
                );

            if (!validation.success) {
                return validation;
            }

            candidate.role =
                updates.role.trim();
        }

        candidate.updatedAt =
            Utils.createTimestamp();

        HistoryService.addHistoryEntry(
            candidate,
            "Candidate Updated"
        );

        return {
            success: true,
            message:
                "Candidate updated successfully.",
            data: candidate
        };
    },

    deleteCandidate(
        candidateId
    ) {

        const candidate =
            this.getCandidate(candidateId);

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

        ATSStore.candidates =
            ATSStore.candidates.filter(
                item =>
                    item.id !==
                    candidateId
            );

        return {
            success: true,
            message:
                "Candidate deleted successfully."
        };
    },

    getCandidate(
        candidateId
    ) {

        return ATSStore.candidates.find(
            candidate =>
                candidate.id ===
                candidateId
        );
    },

    getAllCandidates() {

        return ATSStore.candidates;
    }
};


/* =========================================================
   TRANSITION SERVICE
========================================================= */

const TransitionService = {

    canTransition(
        candidate,
        targetStage
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

        const currentStage =
            candidate.stage;

        /* =========================
           APPLIED
        ========================= */

        if (
            currentStage ===
            STAGES.APPLIED &&
            targetStage ===
            STAGES.INTERVIEWING
        ) {

            return {
                success: true
            };
        }

        /* =========================
           INTERVIEWING
        ========================= */

        if (
            currentStage ===
            STAGES.INTERVIEWING &&
            targetStage ===
            STAGES.APPLIED
        ) {

            return {
                success: true
            };
        }

        /*
           IMPORTANT

           Interviewing ->
           Technical Test

           NOT ALLOWED HERE

           Must go through:

           ScoringService
           .submitTechnicalScore()
        */

        if (
            currentStage ===
            STAGES.INTERVIEWING &&
            targetStage ===
            STAGES.TECHNICAL_TEST
        ) {

            return {
                success: false,
                message:
                    "Technical Test entry requires score submission."
            };
        }

        /* =========================
           TECHNICAL TEST
        ========================= */

        if (
            currentStage ===
            STAGES.TECHNICAL_TEST &&
            targetStage ===
            STAGES.OFFERED
        ) {

            return {
                success: true
            };
        }

        /* =========================
           OFFERED
        ========================= */

        if (
            currentStage ===
            STAGES.OFFERED &&
            targetStage ===
            STAGES.TECHNICAL_TEST
        ) {

            return {
                success: true
            };
        }

        /* =========================
           REJECTED
        ========================= */

        return {
            success: false,
            message:
                "Invalid stage transition."
        };
    },

    executeTransition(
        candidate,
        targetStage
    ) {

        const validation =
            this.canTransition(
                candidate,
                targetStage
            );

        if (!validation.success) {
            return validation;
        }

        candidate.stage =
            targetStage;

        candidate.updatedAt =
            Utils.createTimestamp();

        HistoryService.addHistoryEntry(
            candidate,
            `Moved To ${targetStage}`
        );

        return {
            success: true,
            message:
                "Transition completed.",
            data: candidate
        };
    },

    moveForward(
        candidate
    ) {

        if (!candidate) {

            return {
                success: false,
                message:
                    "Candidate not found."
            };
        }

        const stageMap = {

            [STAGES.APPLIED]:
                STAGES.INTERVIEWING,

            [STAGES.TECHNICAL_TEST]:
                STAGES.OFFERED
        };

        const targetStage =
            stageMap[
            candidate.stage
            ];

        if (!targetStage) {

            return {
                success: false,
                message:
                    "Forward transition unavailable."
            };
        }

        return this.executeTransition(
            candidate,
            targetStage
        );
    },

    moveBackward(
        candidate
    ) {

        if (!candidate) {

            return {
                success: false,
                message:
                    "Candidate not found."
            };
        }

        const stageMap = {

            [STAGES.INTERVIEWING]:
                STAGES.APPLIED,

            [STAGES.OFFERED]:
                STAGES.TECHNICAL_TEST
        };

        const targetStage =
            stageMap[
            candidate.stage
            ];

        if (!targetStage) {

            return {
                success: false,
                message:
                    "Backward transition unavailable."
            };
        }

        return this.executeTransition(
            candidate,
            targetStage
        );
    }
};


/* =========================================================
   ANALYTICS SERVICE
========================================================= */

const AnalyticsService = {

    getMetrics() {

        const candidates =
            ATSStore.candidates;

        const totalCandidates =
            candidates.length;

        const applied =
            candidates.filter(
                c =>
                    c.stage ===
                    STAGES.APPLIED
            ).length;

        const interviewing =
            candidates.filter(
                c =>
                    c.stage ===
                    STAGES.INTERVIEWING
            ).length;

        const technicalTest =
            candidates.filter(
                c =>
                    c.stage ===
                    STAGES.TECHNICAL_TEST
            ).length;

        const offered =
            candidates.filter(
                c =>
                    c.stage ===
                    STAGES.OFFERED
            ).length;

        const rejected =
            candidates.filter(
                c =>
                    c.stage ===
                    STAGES.REJECTED
            ).length;

        const scoredCandidates =
            candidates.filter(
                c =>
                    typeof c.technicalScore ===
                    "number"
            );

        const averageScore =
            scoredCandidates.length
                ? (
                    scoredCandidates.reduce(
                        (
                            total,
                            candidate
                        ) =>
                            total +
                            candidate.technicalScore,
                        0
                    ) /
                    scoredCandidates.length
                ).toFixed(1)
                : "0.0";

        const offerRate =
            totalCandidates
                ? (
                    (offered /
                        totalCandidates) *
                    100
                ).toFixed(1)
                : "0.0";

        const rejectionRate =
            totalCandidates
                ? (
                    (rejected /
                        totalCandidates) *
                    100
                ).toFixed(1)
                : "0.0";

        return {
            success: true,

            data: {

                totalCandidates,

                applied,

                interviewing,

                technicalTest,

                offered,

                rejected,

                averageScore,

                offerRate,

                rejectionRate
            }
        };
    }
};

/* =========================================================
   PART 3
   RENDERING LAYER
   DOM CACHE + RENDERER + DASHBOARD + KANBAN
   + CARDS + TIMELINE + EMPTY STATES
========================================================= */

/* =========================================================
   DOM REFERENCES
========================================================= */

const DOM = {

    /* Dashboard */

    totalCandidatesCount:
        document.getElementById(
            "totalCandidatesCount"
        ),

    appliedCount:
        document.getElementById(
            "appliedCount"
        ),

    interviewingCount:
        document.getElementById(
            "interviewingCount"
        ),

    technicalTestCount:
        document.getElementById(
            "technicalTestCount"
        ),

    offeredCount:
        document.getElementById(
            "offeredCount"
        ),

    rejectedCount:
        document.getElementById(
            "rejectedCount"
        ),

    averageScore:
        document.getElementById(
            "averageScore"
        ),

    offerRate:
        document.getElementById(
            "offerRate"
        ),

    rejectionRate:
        document.getElementById(
            "rejectionRate"
        ),

    /* Candidate Containers */

    appliedCandidates:
        document.getElementById(
            "appliedCandidates"
        ),

    interviewingCandidates:
        document.getElementById(
            "interviewingCandidates"
        ),

    technicalCandidates:
        document.getElementById(
            "technicalCandidates"
        ),

    offeredCandidates:
        document.getElementById(
            "offeredCandidates"
        ),

    rejectedCandidates:
        document.getElementById(
            "rejectedCandidates"
        ),

    /* Empty States */

    appliedEmptyState:
        document.getElementById(
            "appliedEmptyState"
        ),

    interviewingEmptyState:
        document.getElementById(
            "interviewingEmptyState"
        ),

    technicalEmptyState:
        document.getElementById(
            "technicalEmptyState"
        ),

    offeredEmptyState:
        document.getElementById(
            "offeredEmptyState"
        ),

    rejectedEmptyState:
        document.getElementById(
            "rejectedEmptyState"
        ),

    /* Templates */

    candidateCardTemplate:
        document.getElementById(
            "candidateCardTemplate"
        ),

    activityItemTemplate:
        document.getElementById(
            "activityItemTemplate"
        )
};


/* =========================================================
   RENDERER CORE
========================================================= */

const Renderer = {

    getVisibleCandidates() {

        let candidates =
            [...ATSStore.candidates];

        /* Search */

        if (
            ATSStore.searchQuery
        ) {

            const query =
                ATSStore.searchQuery
                    .toLowerCase();

            candidates =
                candidates.filter(
                    candidate => {

                        return (
                            candidate.name
                                .toLowerCase()
                                .includes(query) ||

                            candidate.rollNumber
                                .toLowerCase()
                                .includes(query)
                        );
                    }
                );
        }

        /* Role Filter */

        if (
            ATSStore.filters.role !==
            "all"
        ) {

            candidates =
                candidates.filter(
                    candidate => {

                        const normalizedRole =
                            candidate.role
                                .toLowerCase()
                                .replaceAll(
                                    " ",
                                    "-"
                                );

                        return (
                            normalizedRole ===
                            ATSStore.filters.role
                        );
                    }
                );
        }

        /* Stage Filter */

        if (
            ATSStore.filters.stage !==
            "all"
        ) {

            candidates =
                candidates.filter(
                    candidate =>
                        candidate.stage ===
                        ATSStore.filters.stage
                );
        }

        /* Sorting */

        switch (
        ATSStore.sortMode
        ) {

            case "oldest":

                candidates.sort(
                    (a, b) =>
                        new Date(
                            a.createdAt
                        ) -
                        new Date(
                            b.createdAt
                        )
                );

                break;

            case "highest-score":

                candidates.sort(
                    (a, b) =>
                        (b.technicalScore || 0) -
                        (a.technicalScore || 0)
                );

                break;

            default:

                candidates.sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                );
        }

        return candidates;
    },

    renderAll() {

        DashboardRenderer.render();

        KanbanRenderer.render();

        EmptyStateRenderer.render();
    }
};


/* =========================================================
   DASHBOARD RENDERER
========================================================= */

const DashboardRenderer = {

    render() {

        const metrics =
            AnalyticsService
                .getMetrics();

        if (
            !metrics.success
        ) {
            return;
        }

        const data =
            metrics.data;

        DOM.totalCandidatesCount.textContent =
            data.totalCandidates;

        DOM.appliedCount.textContent =
            data.applied;

        DOM.interviewingCount.textContent =
            data.interviewing;

        DOM.technicalTestCount.textContent =
            data.technicalTest;

        DOM.offeredCount.textContent =
            data.offered;

        DOM.rejectedCount.textContent =
            data.rejected;

        DOM.averageScore.textContent =
            `${data.averageScore}%`;

        DOM.offerRate.textContent =
            `${data.offerRate}%`;

        DOM.rejectionRate.textContent =
            `${data.rejectionRate}%`;
    }
};


/* =========================================================
   CANDIDATE CARD RENDERER
========================================================= */

const CandidateCardRenderer = {

    create(candidate) {

        const fragment =
            DOM.candidateCardTemplate
                .content
                .cloneNode(true);

        const card =
            fragment.querySelector(
                ".candidate-card"
            );

        card.dataset.candidateId =
            candidate.id;

        /* Name */

        fragment
            .querySelector(
                ".candidate-name"
            )
            .textContent =
            candidate.name;

        /* Roll */

        fragment
            .querySelector(
                ".candidate-roll-number"
            )
            .textContent =
            candidate.rollNumber;

        /* Role */

        fragment
            .querySelector(
                ".candidate-role"
            )
            .textContent =
            candidate.role;

        /* Stage */

        const stageBadge =
            fragment.querySelector(
                ".candidate-stage-badge"
            );

        stageBadge.textContent =
            candidate.stage;

        stageBadge.classList.add(
            `stage-${candidate.stage}`
        );

        /* Score */

        const scoreElement =
            fragment.querySelector(
                ".candidate-score"
            );

        if (
            typeof candidate.technicalScore ===
            "number"
        ) {

            scoreElement
                .classList
                .remove("hidden");

            fragment
                .querySelector(
                    ".score-value"
                )
                .textContent =
                candidate.technicalScore;
        }

        /* Lock */

        const lockBadge =
            fragment.querySelector(
                ".candidate-lock-badge"
            );

        if (
            candidate.isLocked
        ) {

            card.classList.add(
                "rejected-card"
            );

            lockBadge
                .classList
                .remove("hidden");
        }

        return fragment;
    }
};


/* =========================================================
   KANBAN RENDERER
========================================================= */

const KanbanRenderer = {

    clearContainers() {

        [
            DOM.appliedCandidates,
            DOM.interviewingCandidates,
            DOM.technicalCandidates,
            DOM.offeredCandidates,
            DOM.rejectedCandidates
        ]
            .forEach(container => {

                Array
                    .from(
                        container.children
                    )
                    .forEach(child => {

                        if (
                            !child.classList
                                .contains(
                                    "empty-state"
                                )
                        ) {

                            child.remove();
                        }
                    });
            });
    },

    render() {

        this.clearContainers();

        const candidates =
            Renderer
                .getVisibleCandidates();

        candidates.forEach(
            candidate => {

                const card =
                    CandidateCardRenderer
                        .create(
                            candidate
                        );

                switch (
                candidate.stage
                ) {

                    case STAGES.APPLIED:

                        DOM
                            .appliedCandidates
                            .appendChild(
                                card
                            );

                        break;

                    case STAGES.INTERVIEWING:

                        DOM
                            .interviewingCandidates
                            .appendChild(
                                card
                            );

                        break;

                    case STAGES.TECHNICAL_TEST:

                        DOM
                            .technicalCandidates
                            .appendChild(
                                card
                            );

                        break;

                    case STAGES.OFFERED:

                        DOM
                            .offeredCandidates
                            .appendChild(
                                card
                            );

                        break;

                    case STAGES.REJECTED:

                        DOM
                            .rejectedCandidates
                            .appendChild(
                                card
                            );

                        break;
                }
            });
    }
};


/* =========================================================
   TIMELINE RENDERER
========================================================= */

const TimelineRenderer = {

    render(
        candidate,
        container
    ) {

        if (
            !candidate ||
            !container
        ) {
            return;
        }

        container.innerHTML = "";

        const history =
            HistoryService
                .getHistory(
                    candidate
                );

        history
            .slice()
            .reverse()
            .forEach(
                item => {

                    const fragment =
                        DOM
                            .activityItemTemplate
                            .content
                            .cloneNode(
                                true
                            );

                    fragment
                        .querySelector(
                            ".timeline-action"
                        )
                        .textContent =
                        item.action;

                    fragment
                        .querySelector(
                            ".timeline-timestamp"
                        )
                        .textContent =
                        Utils
                            .formatDate(
                                item.timestamp
                            );

                    container
                        .appendChild(
                            fragment
                        );
                }
            );
    }
};


/* =========================================================
   EMPTY STATE RENDERER
========================================================= */

const EmptyStateRenderer = {

    render() {

        const stages = [

            {
                container:
                    DOM.appliedCandidates,
                empty:
                    DOM.appliedEmptyState
            },

            {
                container:
                    DOM.interviewingCandidates,
                empty:
                    DOM.interviewingEmptyState
            },

            {
                container:
                    DOM.technicalCandidates,
                empty:
                    DOM.technicalEmptyState
            },

            {
                container:
                    DOM.offeredCandidates,
                empty:
                    DOM.offeredEmptyState
            },

            {
                container:
                    DOM.rejectedCandidates,
                empty:
                    DOM.rejectedEmptyState
            }
        ];

        stages.forEach(
            stage => {

                const cardCount =
                    stage.container
                        .querySelectorAll(
                            ".candidate-card"
                        )
                        .length;

                stage.empty
                    .classList.toggle(
                        "hidden",
                        cardCount > 0
                    );
            }
        );
    }
};

/* =========================================================
   PART 4A
   MODAL MANAGER + TOAST MANAGER + UI HELPERS
   + KANBAN COUNT RENDERER + DETAILS MODAL RENDERER
========================================================= */


/* =========================================================
   ADDITIONAL DOM REFERENCES
========================================================= */

Object.assign(DOM, {

    /* Overlay */

    modalOverlay:
        document.getElementById(
            "modalOverlay"
        ),

    /* Candidate Modal */

    candidateModal:
        document.getElementById(
            "candidateModal"
        ),

    /* Score Modal */

    technicalScoreModal:
        document.getElementById(
            "technicalScoreModal"
        ),

    /* Offer Modal */

    offerConfirmationModal:
        document.getElementById(
            "offerConfirmationModal"
        ),

    /* Delete Modal */

    deleteConfirmationModal:
        document.getElementById(
            "deleteConfirmationModal"
        ),

    /* Details Modal */

    candidateDetailsModal:
        document.getElementById(
            "candidateDetailsModal"
        ),

    /* Toast */

    toastContainer:
        document.getElementById(
            "toastContainer"
        ),

    toastTemplate:
        document.getElementById(
            "toastTemplate"
        ),

    /* Kanban Count Badges */

    appliedBadgeCount:
        document.getElementById(
            "appliedBadgeCount"
        ),

    interviewingBadgeCount:
        document.getElementById(
            "interviewingBadgeCount"
        ),

    technicalBadgeCount:
        document.getElementById(
            "technicalBadgeCount"
        ),

    offeredBadgeCount:
        document.getElementById(
            "offeredBadgeCount"
        ),

    rejectedBadgeCount:
        document.getElementById(
            "rejectedBadgeCount"
        ),

    /* Details Modal Fields */

    detailsName:
        document.getElementById(
            "detailsName"
        ),

    detailsRollNumber:
        document.getElementById(
            "detailsRollNumber"
        ),

    detailsRole:
        document.getElementById(
            "detailsRole"
        ),

    detailsStage:
        document.getElementById(
            "detailsStage"
        ),

    detailsScore:
        document.getElementById(
            "detailsScore"
        ),

    detailsCreatedAt:
        document.getElementById(
            "detailsCreatedAt"
        ),

    detailsUpdatedAt:
        document.getElementById(
            "detailsUpdatedAt"
        ),

    activityTimeline:
        document.getElementById(
            "activityTimeline"
        )
});


/* =========================================================
   UI HELPERS
========================================================= */

const UIHelpers = {

    formatStageLabel(stage) {

        const map = {

            [STAGES.APPLIED]:
                "Applied",

            [STAGES.INTERVIEWING]:
                "Interviewing",

            [STAGES.TECHNICAL_TEST]:
                "Technical Test",

            [STAGES.OFFERED]:
                "Offered",

            [STAGES.REJECTED]:
                "Rejected"
        };

        return map[stage] || stage;
    }
};


/* =========================================================
   MODAL MANAGER
========================================================= */

const ModalManager = {

    getModalMap() {

        return {

            candidate:
                DOM.candidateModal,

            score:
                DOM.technicalScoreModal,

            offer:
                DOM.offerConfirmationModal,

            delete:
                DOM.deleteConfirmationModal,

            details:
                DOM.candidateDetailsModal
        };
    },

    openModal(modalKey) {

        const modal =
            this.getModalMap()[
            modalKey
            ];

        if (!modal) {
            return;
        }

        this.closeAllModals();

        ATSStore.modalState.activeModal =
            modalKey;

        DOM.modalOverlay
            .classList
            .remove("hidden");

        modal.classList.remove(
            "hidden"
        );
    },

    closeModal(modalKey) {

        const modal =
            this.getModalMap()[
            modalKey
            ];

        if (!modal) {
            return;
        }

        modal.classList.add(
            "hidden"
        );

        ATSStore.modalState.activeModal =
            null;

        DOM.modalOverlay
            .classList
            .add("hidden");
    },

    closeAllModals() {

        Object.values(
            this.getModalMap()
        )
            .forEach(modal => {

                modal.classList.add(
                    "hidden"
                );
            });

        ATSStore.modalState.activeModal =
            null;

        DOM.modalOverlay
            .classList
            .add("hidden");
    }
};


/* =========================================================
   TOAST MANAGER
========================================================= */

const ToastManager = {

    show(
        message,
        type = "info",
        duration = 3500
    ) {

        const fragment =
            DOM.toastTemplate
                .content
                .cloneNode(true);

        const toast =
            fragment.querySelector(
                ".toast"
            );

        toast.classList.add(
            `toast-${type}`
        );

        fragment
            .querySelector(
                ".toast-message"
            )
            .textContent =
            message;

        DOM.toastContainer
            .appendChild(
                fragment
            );

        const insertedToast =
            DOM.toastContainer
                .lastElementChild;

        setTimeout(() => {

            insertedToast?.remove();

        }, duration);
    },

    success(message) {

        this.show(
            message,
            "success"
        );
    },

    error(message) {

        this.show(
            message,
            "error"
        );
    },

    warning(message) {

        this.show(
            message,
            "warning"
        );
    },

    info(message) {

        this.show(
            message,
            "info"
        );
    }
};


/* =========================================================
   KANBAN COUNT RENDERER
========================================================= */

Renderer.updateKanbanCounts =
    function () {

        const visibleCandidates =
            Renderer
                .getVisibleCandidates();

        const counts = {

            applied: 0,

            interviewing: 0,

            technical: 0,

            offered: 0,

            rejected: 0
        };

        visibleCandidates
            .forEach(candidate => {

                switch (
                candidate.stage
                ) {

                    case STAGES.APPLIED:
                        counts.applied++;
                        break;

                    case STAGES.INTERVIEWING:
                        counts.interviewing++;
                        break;

                    case STAGES.TECHNICAL_TEST:
                        counts.technical++;
                        break;

                    case STAGES.OFFERED:
                        counts.offered++;
                        break;

                    case STAGES.REJECTED:
                        counts.rejected++;
                        break;
                }
            });

        DOM.appliedBadgeCount.textContent =
            counts.applied;

        DOM.interviewingBadgeCount.textContent =
            counts.interviewing;

        DOM.technicalBadgeCount.textContent =
            counts.technical;

        DOM.offeredBadgeCount.textContent =
            counts.offered;

        DOM.rejectedBadgeCount.textContent =
            counts.rejected;
    };


/* =========================================================
   DETAILS MODAL RENDERER
========================================================= */

const DetailsModalRenderer = {

    render(candidate) {

        if (!candidate) {
            return;
        }

        DOM.detailsName.textContent =
            candidate.name;

        DOM.detailsRollNumber.textContent =
            candidate.rollNumber;

        DOM.detailsRole.textContent =
            candidate.role;

        DOM.detailsStage.textContent =
            UIHelpers
                .formatStageLabel(
                    candidate.stage
                );

        DOM.detailsScore.textContent =
            typeof candidate.technicalScore ===
                "number"
                ? candidate.technicalScore
                : "N/A";

        DOM.detailsCreatedAt.textContent =
            Utils.formatDate(
                candidate.createdAt
            );

        DOM.detailsUpdatedAt.textContent =
            Utils.formatDate(
                candidate.updatedAt
            );

        TimelineRenderer.render(
            candidate,
            DOM.activityTimeline
        );
    }
};


/* =========================================================
   RENDERER ENHANCEMENT
========================================================= */

const originalRenderAll =
    Renderer.renderAll.bind(
        Renderer
    );

Renderer.renderAll =
    function () {

        originalRenderAll();

        Renderer.updateKanbanCounts();
    };

/* =========================================================
PART 4B
CONTROLLER HELPERS
SEARCH CONTROLLER
FILTER CONTROLLER
SORT CONTROLLER
CANDIDATE FORM CONTROLLER
========================================================= */


/* =========================================================
   ADDITIONAL DOM REFERENCES
========================================================= */

Object.assign(DOM, {

    searchInput:
        document.getElementById(
            "searchInput"
        ),

    roleFilter:
        document.getElementById(
            "roleFilter"
        ),

    stageFilter:
        document.getElementById(
            "stageFilter"
        ),

    sortCandidates:
        document.getElementById(
            "sortCandidates"
        ),

    candidateForm:
        document.getElementById(
            "candidateForm"
        ),

    candidateName:
        document.getElementById(
            "candidateName"
        ),

    candidateRollNumber:
        document.getElementById(
            "candidateRollNumber"
        ),

    candidateRole:
        document.getElementById(
            "candidateRole"
        ),

    customRole:
        document.getElementById(
            "customRole"
        )
});


/* =========================================================
   CONTROLLER HELPERS
========================================================= */

const ControllerHelpers = {

    persistAndRender() {

        StorageService.saveCandidates(
            ATSStore.candidates
        );

        Renderer.renderAll();
    },

    showResultToast(result) {

        if (!result) {
            return;
        }

        if (result.success) {

            ToastManager.success(
                result.message
            );

        } else {

            ToastManager.error(
                result.message
            );
        }
    }
};


/* =========================================================
   SEARCH CONTROLLER
========================================================= */

const SearchController = {

    handleInput(event) {

        ATSStore.searchQuery =
            event.target.value
                .trim()
                .toLowerCase();

        Renderer.renderAll();
    },

    initialize() {

        if (!DOM.searchInput) {
            return;
        }

        DOM.searchInput
            .addEventListener(
                "input",
                this.handleInput
            );
    }
};


/* =========================================================
   FILTER CONTROLLER
========================================================= */

const FilterController = {

    handleRoleFilter(event) {

        ATSStore.filters.role =
            event.target.value;

        Renderer.renderAll();
    },

    handleStageFilter(event) {

        ATSStore.filters.stage =
            event.target.value;

        Renderer.renderAll();
    },

    initialize() {

        DOM.roleFilter
            ?.addEventListener(
                "change",
                this.handleRoleFilter
            );

        DOM.stageFilter
            ?.addEventListener(
                "change",
                this.handleStageFilter
            );
    }
};


/* =========================================================
   SORT CONTROLLER
========================================================= */

const SortController = {

    handleSort(event) {

        ATSStore.sortMode =
            event.target.value;

        Renderer.renderAll();
    },

    initialize() {

        DOM.sortCandidates
            ?.addEventListener(
                "change",
                this.handleSort
            );
    }
};


/* =========================================================
   CANDIDATE FORM CONTROLLER
========================================================= */

const CandidateFormController = {

    getRoleValue() {

        const selectedRole =
            DOM.candidateRole?.value;

        if (
            selectedRole ===
            "custom"
        ) {

            return DOM.customRole
                ?.value
                ?.trim();
        }

        return selectedRole;
    },

    resetForm() {

        DOM.candidateForm
            ?.reset();

        DOM.customRole
            ?.classList
            .add("hidden");
    },

    toggleCustomRole() {

        if (
            DOM.candidateRole?.value ===
            "custom"
        ) {

            DOM.customRole
                ?.classList
                .remove("hidden");

        } else {

            DOM.customRole
                ?.classList
                .add("hidden");
        }
    },

    createPayload() {

        return {

            name:
                DOM.candidateName
                    ?.value
                    ?.trim(),

            rollNumber:
                DOM.candidateRollNumber
                    ?.value
                    ?.trim(),

            role:
                this.getRoleValue()
        };
    },

    handleSubmit(event) {

        event.preventDefault();

        const payload =
            CandidateFormController
                .createPayload();

        const result =
            CandidateService
                .createCandidate(
                    payload
                );

        ControllerHelpers
            .showResultToast(
                result
            );

        if (!result.success) {
            return;
        }

        ControllerHelpers
            .persistAndRender();

        CandidateFormController
            .resetForm();

        ModalManager.closeModal(
            "candidate"
        );
    },

    initialize() {

        DOM.candidateRole
            ?.addEventListener(
                "change",
                () =>
                    this.toggleCustomRole()
            );

        DOM.candidateForm
            ?.addEventListener(
                "submit",
                this.handleSubmit
            );
    }
};