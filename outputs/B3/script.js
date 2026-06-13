/* =========================================================
   PART 1 — CONFIGURATION, STATE & APPLICATION BOOTSTRAP
   ========================================================= */

/* =========================================================
   APPLICATION CONFIGURATION
   ========================================================= */

const CONFIG = {
    pricing: {
        VIP: 500,
        CLUB: 300,
        FRONT: 150
    },

    layout: {
        VIP: {
            rows: ["A", "B"],
            seatsPerRow: 8
        },

        CLUB: {
            rows: ["C", "D", "E"],
            seatsPerRow: 10
        },

        FRONT: {
            rows: ["F", "G", "H"],
            seatsPerRow: 12
        }
    },

    booking: {
        maxSeatsPerBooking: 8
    },

    storage: {
        bookedSeatsKey: "seatBooking_bookedSeats",
        bookingHistoryKey: "seatBooking_bookingHistory",
        revenueKey: "seatBooking_revenue"
    }
};

/* =========================================================
   CENTRALIZED APPLICATION STATE
   ========================================================= */

const appState = {
    seats: [],

    selectedSeats: [],

    bookings: [],

    revenue: 0
};

/* =========================================================
   DOM CACHE
   ========================================================= */

const DOM = {
    seatGrid: document.getElementById("seat-grid"),

    selectedSeats: document.getElementById("selected-seats"),

    seatCount: document.getElementById("seat-count"),

    tierBreakdown: document.getElementById("tier-breakdown"),

    totalPrice: document.getElementById("total-price"),

    clearBtn: document.getElementById("clear-btn"),

    confirmBtn: document.getElementById("confirm-btn"),

    availableCount: document.getElementById("available-count"),

    bookedCount: document.getElementById("booked-count"),

    selectedCount: document.getElementById("selected-count"),

    revenueTotal: document.getElementById("revenue-total"),

    occupancyRate: document.getElementById("occupancy-rate"),

    bookingCount: document.getElementById("booking-count"),

    historyList: document.getElementById("history-list"),

    bookingModal: document.getElementById("booking-modal"),

    modalSeats: document.getElementById("modal-seats"),

    modalPrice: document.getElementById("modal-price"),

    cancelBookingBtn: document.getElementById("cancel-booking"),

    confirmBookingBtn: document.getElementById("confirm-booking"),

    toastContainer: document.getElementById("toast-container"),

    announcementRegion: document.getElementById("announcement-region")
};

/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

/**
 * Formats numbers as INR currency.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Generates a unique booking ID.
 * Example: BK-1718293021-X4P8
 * @returns {string}
 */
function generateBookingId() {
    const timestamp = Date.now();

    const randomSegment = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    return `BK-${timestamp}-${randomSegment}`;
}

/**
 * Formats timestamps for booking history.
 * @param {number|string|Date} value
 * @returns {string}
 */
function formatDateTime(value) {
    const date = new Date(value);

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

/**
 * Safe DOM lookup helper.
 * Throws if element is missing.
 * @param {string} id
 * @returns {HTMLElement}
 */
function getRequiredElement(id) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Required DOM element not found: ${id}`);
    }

    return element;
}

/**
 * Returns a seat object by seat ID.
 * @param {string} seatId
 * @returns {Object|undefined}
 */
function getSeatById(seatId) {
    return appState.seats.find(
        seat => seat.id === seatId
    );
}

/**
 * Checks whether a seat is selected.
 * @param {string} seatId
 * @returns {boolean}
 */
function isSeatSelected(seatId) {
    return appState.selectedSeats.includes(seatId);
}

/**
 * Returns selected seat objects.
 * @returns {Array}
 */
function getSelectedSeatObjects() {
    return appState.selectedSeats
        .map(getSeatById)
        .filter(Boolean);
}

/**
 * Returns booked seat objects.
 * @returns {Array}
 */
function getBookedSeats() {
    return appState.seats.filter(
        seat => seat.state === "booked"
    );
}

/**
 * Returns available seat objects.
 * @returns {Array}
 */
function getAvailableSeats() {
    return appState.seats.filter(
        seat => seat.state === "available"
    );
}

/**
 * Returns selected seat objects.
 * @returns {Array}
 */
function getSelectedSeats() {
    return appState.seats.filter(
        seat => seat.state === "selected"
    );
}

/* =========================================================
   VALIDATION HELPERS
   ========================================================= */

/**
 * Validates seat state.
 * @param {string} state
 * @returns {boolean}
 */
function isValidSeatState(state) {
    return [
        "available",
        "selected",
        "booked"
    ].includes(state);
}

/**
 * Validates tier value.
 * @param {string} tier
 * @returns {boolean}
 */
function isValidTier(tier) {
    return [
        "VIP",
        "CLUB",
        "FRONT"
    ].includes(tier);
}

/* =========================================================
   APPLICATION INITIALIZATION
   ========================================================= */

/**
 * Main application bootstrap.
 * Future modules will be integrated here.
 */
function initializeApp() {
    console.log(
        "🎬 Seat Booking Engine Initializing..."
    );

    console.log(
        "Configuration loaded:",
        CONFIG
    );

    console.log(
        "Application state ready."
    );
}

/* =========================================================
   PAGE LOAD ENTRY POINT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeApp();
    }
);