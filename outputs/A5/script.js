/* ==================================================
   1. CONSTANTS
================================================== */

const STORAGE_KEY = "festRegistrations";
const COLLEGE_DOMAIN = "@college.edu";

/* ==================================================
   2. EVENT CONFIGURATION
================================================== */

const EVENTS = [
    {
        id: "coding-competition",
        name: "Coding Competition",
        slot: "Morning"
    },
    {
        id: "sports-tournament",
        name: "Sports Tournament",
        slot: "Morning"
    },
    {
        id: "music-performance",
        name: "Music Performance",
        slot: "Afternoon"
    },
    {
        id: "art-exhibition",
        name: "Art Exhibition",
        slot: "Evening"
    }
];

/* ==================================================
   3. APPLICATION STATE
================================================== */

let registrations = [];

/* ==================================================
   4. DOM REFERENCES
================================================== */

const domElements = {
    registrationForm: document.getElementById("registration-form"),

    studentNameInput: document.getElementById("student-name"),
    studentIdInput: document.getElementById("student-id"),
    collegeEmailInput: document.getElementById("college-email"),
    phoneNumberInput: document.getElementById("phone-number"),
    eventSelectionInput: document.getElementById("event-selection"),

    submitRegistrationButton: document.getElementById(
        "submit-registration-button"
    ),

    successMessage: document.getElementById(
        "form-success-message"
    ),
    errorMessage: document.getElementById(
        "form-error-message"
    ),

    totalRegistrationsCount: document.getElementById(
        "total-registrations-count"
    ),
    codingCompetitionCount: document.getElementById(
        "coding-competition-count"
    ),
    sportsTournamentCount: document.getElementById(
        "sports-tournament-count"
    ),
    musicPerformanceCount: document.getElementById(
        "music-performance-count"
    ),
    artExhibitionCount: document.getElementById(
        "art-exhibition-count"
    ),

    participantsTableBody: document.getElementById(
        "participants-table-body"
    ),

    participantsEmptyState: document.getElementById(
        "participants-empty-state"
    )
};

/* ==================================================
   5. STORAGE LAYER
================================================== */

function loadRegistrations() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {
            return [];
        }

        const parsedData = JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {
            console.warn(
                "Stored registration data is not an array. Resetting data."
            );
            return [];
        }

        return parsedData;
    } catch (error) {
        console.error(
            "Failed to load registration data:",
            error
        );

        return [];
    }
}

function saveRegistrations() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(registrations)
        );

        return true;
    } catch (error) {
        console.error(
            "Failed to save registration data:",
            error
        );

        return false;
    }
}

/* ==================================================
   6. INITIALIZATION FOUNDATION
================================================== */

function getEventById(eventId) {
    return EVENTS.find(
        (event) => event.id === eventId
    ) || null;
}

function getEventByName(eventName) {
    return EVENTS.find(
        (event) => event.name === eventName
    ) || null;
}

function initializeApplicationState() {
    registrations = loadRegistrations();
}

function validateDomReferences() {
    const missingElements = [];

    Object.entries(domElements).forEach(
        ([key, value]) => {
            if (!value) {
                missingElements.push(key);
            }
        }
    );

    if (missingElements.length > 0) {
        console.error(
            "Missing required DOM elements:",
            missingElements
        );

        return false;
    }

    return true;
}

function initializeFoundation() {
    initializeApplicationState();
    validateDomReferences();
}