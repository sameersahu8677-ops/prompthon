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

/* ==================================================
   1. VALIDATION MESSAGE REFERENCES
================================================== */

const validationElements = {
    studentName: document.getElementById(
        "student-name-validation"
    ),
    studentId: document.getElementById(
        "student-id-validation"
    ),
    collegeEmail: document.getElementById(
        "college-email-validation"
    ),
    phoneNumber: document.getElementById(
        "phone-number-validation"
    ),
    eventSelection: document.getElementById(
        "event-selection-validation"
    )
};

/* ==================================================
   2. VALIDATION UI HELPERS
================================================== */

function clearFieldValidationMessages() {
    Object.values(validationElements).forEach(
        (element) => {
            if (element) {
                element.textContent = "";
            }
        }
    );
}

function showFieldValidation(fieldName, message) {
    const fieldElement =
        validationElements[fieldName];

    if (!fieldElement) {
        return;
    }

    fieldElement.textContent = message;
}

function clearAllValidationMessages() {
    clearFieldValidationMessages();
}

/* ==================================================
   3. INPUT NORMALIZATION
================================================== */

function normalizeRegistrationData(
    registrationData
) {
    return {
        studentName:
            registrationData.studentName?.trim() ||
            "",

        studentId:
            registrationData.studentId
                ?.trim()
                .toUpperCase() || "",

        collegeEmail:
            registrationData.collegeEmail
                ?.trim()
                .toLowerCase() || "",

        phoneNumber:
            registrationData.phoneNumber?.replace(
                /\s+/g,
                ""
            ) || "",

        eventSelection:
            registrationData.eventSelection?.trim() ||
            ""
    };
}

/* ==================================================
   4. VALIDATION HELPERS
================================================== */

function createValidationResult(
    isValid,
    field = null,
    message = ""
) {
    return {
        isValid,
        errors: field
            ? {
                [field]: message
            }
            : {}
    };
}

function validateRequiredFields(
    registrationData
) {
    const requiredFields = [
        {
            key: "studentName",
            field: "studentName",
            message:
                "Student name is required."
        },
        {
            key: "studentId",
            field: "studentId",
            message:
                "Student ID is required."
        },
        {
            key: "collegeEmail",
            field: "collegeEmail",
            message:
                "College email is required."
        },
        {
            key: "phoneNumber",
            field: "phoneNumber",
            message:
                "Phone number is required."
        },
        {
            key: "eventSelection",
            field: "eventSelection",
            message:
                "Please select an event."
        }
    ];

    for (const field of requiredFields) {
        if (!registrationData[field.key]) {
            return createValidationResult(
                false,
                field.field,
                field.message
            );
        }
    }

    return createValidationResult(true);
}

function validatePhoneNumber(
    phoneNumber
) {
    const phonePattern = /^\d{10}$/;

    if (!phonePattern.test(phoneNumber)) {
        return createValidationResult(
            false,
            "phoneNumber",
            "Phone number must contain exactly 10 digits."
        );
    }

    return createValidationResult(true);
}

function validateCollegeEmail(
    email
) {
    if (
        !email.endsWith(COLLEGE_DOMAIN)
    ) {
        return createValidationResult(
            false,
            "collegeEmail",
            `Email must end with ${COLLEGE_DOMAIN}.`
        );
    }

    return createValidationResult(true);
}

function checkDuplicateRegistration(
    registrationData
) {
    const duplicateExists =
        registrations.some(
            (registration) =>
                registration.studentId ===
                registrationData.studentId &&
                registration.eventId ===
                registrationData.eventSelection
        );

    if (duplicateExists) {
        return createValidationResult(
            false,
            "eventSelection",
            "You are already registered for this event."
        );
    }

    return createValidationResult(true);
}

function checkSlotConflict(
    registrationData
) {
    const selectedEvent =
        getEventById(
            registrationData.eventSelection
        );

    if (!selectedEvent) {
        return createValidationResult(
            false,
            "eventSelection",
            "Invalid event selection."
        );
    }

    const conflictingRegistration =
        registrations.find(
            (registration) =>
                registration.studentId ===
                registrationData.studentId &&
                registration.slot ===
                selectedEvent.slot &&
                registration.eventId !==
                selectedEvent.id
        );

    if (conflictingRegistration) {
        return createValidationResult(
            false,
            "eventSelection",
            "You already have an event scheduled in this time slot."
        );
    }

    return createValidationResult(true);
}

/* ==================================================
   5. VALIDATION ENGINE
================================================== */

function validateRegistration(
    registrationData
) {
    clearAllValidationMessages();

    const requiredValidation =
        validateRequiredFields(
            registrationData
        );

    if (!requiredValidation.isValid) {
        const [
            field,
            message
        ] = Object.entries(
            requiredValidation.errors
        )[0];

        showFieldValidation(
            field,
            message
        );

        return requiredValidation;
    }

    const phoneValidation =
        validatePhoneNumber(
            registrationData.phoneNumber
        );

    if (!phoneValidation.isValid) {
        const [
            field,
            message
        ] = Object.entries(
            phoneValidation.errors
        )[0];

        showFieldValidation(
            field,
            message
        );

        return phoneValidation;
    }

    const emailValidation =
        validateCollegeEmail(
            registrationData.collegeEmail
        );

    if (!emailValidation.isValid) {
        const [
            field,
            message
        ] = Object.entries(
            emailValidation.errors
        )[0];

        showFieldValidation(
            field,
            message
        );

        return emailValidation;
    }

    const duplicateValidation =
        checkDuplicateRegistration(
            registrationData
        );

    if (
        !duplicateValidation.isValid
    ) {
        const [
            field,
            message
        ] = Object.entries(
            duplicateValidation.errors
        )[0];

        showFieldValidation(
            field,
            message
        );

        return duplicateValidation;
    }

    const conflictValidation =
        checkSlotConflict(
            registrationData
        );

    if (
        !conflictValidation.isValid
    ) {
        const [
            field,
            message
        ] = Object.entries(
            conflictValidation.errors
        )[0];

        showFieldValidation(
            field,
            message
        );

        return conflictValidation;
    }

    return createValidationResult(true);
}