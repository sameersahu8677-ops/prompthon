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

/* =========================================================
   PART 2 — SEAT ENGINE & UI RENDERING
   ========================================================= */

/* =========================================================
   SEAT ENGINE
   ========================================================= */

/**
 * Creates a single seat object.
 * @param {string} row
 * @param {number} number
 * @param {string} tier
 * @returns {Object}
 */
function createSeat(row, number, tier) {
    return {
        id: `${row}${number}`,
        row,
        number,
        tier,
        price: CONFIG.pricing[tier],
        state: "available"
    };
}

/**
 * Generates all seats from CONFIG.
 * @returns {Array}
 */
function generateSeatLayout() {
    const seats = [];

    Object.entries(CONFIG.layout).forEach(
        ([tier, tierConfig]) => {

            tierConfig.rows.forEach(row => {

                for (
                    let seatNumber = 1;
                    seatNumber <= tierConfig.seatsPerRow;
                    seatNumber++
                ) {
                    seats.push(
                        createSeat(
                            row,
                            seatNumber,
                            tier
                        )
                    );
                }

            });

        }
    );

    return seats;
}

/**
 * Initializes seat state.
 */
function initializeSeats() {
    appState.seats = generateSeatLayout();
}

/* =========================================================
   SEAT GROUPING HELPERS
   ========================================================= */

/**
 * Returns seats grouped by tier.
 * @returns {Object}
 */
function groupSeatsByTier() {
    return appState.seats.reduce(
        (groups, seat) => {

            if (!groups[seat.tier]) {
                groups[seat.tier] = [];
            }

            groups[seat.tier].push(seat);

            return groups;

        },
        {}
    );
}

/**
 * Returns seats grouped by row.
 * @param {Array} seats
 * @returns {Object}
 */
function groupSeatsByRow(seats) {
    return seats.reduce(
        (groups, seat) => {

            if (!groups[seat.row]) {
                groups[seat.row] = [];
            }

            groups[seat.row].push(seat);

            return groups;

        },
        {}
    );
}

/* =========================================================
   CSS CLASS HELPERS
   ========================================================= */

/**
 * Returns seat state class.
 * @param {Object} seat
 * @returns {string}
 */
function getSeatStateClass(seat) {

    switch (seat.state) {

        case "selected":
            return "seat-selected";

        case "booked":
            return "seat-booked";

        default:
            return "seat-available";
    }
}

/**
 * Returns tier class.
 * @param {string} tier
 * @returns {string}
 */
function getTierClass(tier) {

    switch (tier) {

        case "VIP":
            return "vip";

        case "CLUB":
            return "club";

        case "FRONT":
            return "front";

        default:
            return "";
    }
}

/**
 * Returns seat-specific classes.
 * @param {Object} seat
 * @returns {string}
 */
function buildSeatClassList(seat) {

    const classes = [
        "seat",
        getSeatStateClass(seat)
    ];

    if (seat.tier === "VIP") {
        classes.push("vip-seat");
    }

    return classes.join(" ");
}

/* =========================================================
   HTML GENERATORS
   ========================================================= */

/**
 * Creates seat button HTML.
 * @param {Object} seat
 * @returns {string}
 */
function createSeatMarkup(seat) {

    return `
        <button
            type="button"
            class="${buildSeatClassList(seat)}"
            data-seat-id="${seat.id}"
            aria-label="${seat.id} ${seat.tier} ${seat.state}"
            aria-pressed="${seat.state === "selected"}"
            ${seat.state === "booked" ? "disabled" : ""}
        >
            ${seat.number}
        </button>
    `;
}

/**
 * Creates row HTML.
 * @param {string} row
 * @param {Array} seats
 * @returns {string}
 */
function createRowMarkup(row, seats) {

    const seatsHTML = seats
        .map(createSeatMarkup)
        .join("");

    return `
        <div class="seat-row">
            <div class="row-label">
                ${row}
            </div>

            ${seatsHTML}
        </div>
    `;
}

/**
 * Creates tier section HTML.
 * @param {string} tier
 * @param {Array} seats
 * @returns {string}
 */
function createTierMarkup(tier, seats) {

    const groupedRows = groupSeatsByRow(seats);

    const rowsHTML = Object.entries(groupedRows)
        .map(([row, rowSeats]) =>
            createRowMarkup(row, rowSeats)
        )
        .join("");

    return `
        <section class="tier-section">

            <div
                class="tier-header ${getTierClass(tier)}"
            >
                <span>${tier}</span>

                <span>
                    ₹${CONFIG.pricing[tier]}
                </span>
            </div>

            ${rowsHTML}

        </section>
    `;
}

/* =========================================================
   SEAT GRID RENDERER
   ========================================================= */

/**
 * Renders complete seat grid.
 */
function renderSeatGrid() {

    if (!DOM.seatGrid) {
        return;
    }

    const groupedTiers = groupSeatsByTier();

    const tierOrder = [
        "VIP",
        "CLUB",
        "FRONT"
    ];

    const html = tierOrder
        .filter(
            tier => groupedTiers[tier]
        )
        .map(
            tier =>
                createTierMarkup(
                    tier,
                    groupedTiers[tier]
                )
        )
        .join("");

    DOM.seatGrid.innerHTML = html;
}

/* =========================================================
   UI REFRESH HELPERS
   ========================================================= */

/**
 * Re-renders seat grid.
 * Future modules will trigger this.
 */
function refreshSeatUI() {
    renderSeatGrid();
}

/* =========================================================
   SEAT INITIALIZATION FLOW
   ========================================================= */

/**
 * Creates and renders all seats.
 */
function setupSeatEngine() {

    initializeSeats();

    renderSeatGrid();

    console.log(
        `🎟️ Generated ${appState.seats.length} seats`
    );
}

/* =========================================================
   INITIALIZATION INTEGRATION
   ========================================================= */

/*
   Replace the current initializeApp()
   from Part 1 with this version.
*/

function initializeApp() {

    console.log(
        "🎬 Seat Booking Engine Initializing..."
    );

    setupSeatEngine();

    console.log(
        "✅ Seat engine initialized."
    );
}

/* =========================================================
   PART 3 — SELECTION LOGIC & TRANSACTION MANAGER
   ========================================================= */

/* =========================================================
   TRANSACTION STATE
   ========================================================= */

const transactionState = {
    active: false,
    seats: []
};

/* =========================================================
   SEAT SELECTION HELPERS
   ========================================================= */

/**
 * Returns true if booking limit reached.
 * @returns {boolean}
 */
function hasReachedBookingLimit() {
    return (
        appState.selectedSeats.length >=
        CONFIG.booking.maxSeatsPerBooking
    );
}

/**
 * Updates transaction snapshot.
 */
function syncTransactionState() {

    transactionState.active =
        appState.selectedSeats.length > 0;

    transactionState.seats =
        [...appState.selectedSeats];
}

/* =========================================================
   SEAT SELECTION
   ========================================================= */

/**
 * Selects a seat.
 * @param {string} seatId
 * @returns {boolean}
 */
function selectSeat(seatId) {

    const seat = getSeatById(seatId);

    if (!seat) {
        return false;
    }

    if (seat.state === "booked") {

        if (typeof showToast === "function") {
            showToast(
                "Seat already booked.",
                "error"
            );
        }

        return false;
    }

    if (seat.state === "selected") {
        return false;
    }

    if (hasReachedBookingLimit()) {

        if (typeof showToast === "function") {
            showToast(
                `Maximum ${CONFIG.booking.maxSeatsPerBooking} seats allowed per booking.`,
                "warning"
            );
        }

        return false;
    }

    seat.state = "selected";

    appState.selectedSeats.push(seatId);

    syncTransactionState();

    refreshSeatUI();

    return true;
}

/**
 * Unselects a seat.
 * @param {string} seatId
 * @returns {boolean}
 */
function unselectSeat(seatId) {

    const seat = getSeatById(seatId);

    if (!seat) {
        return false;
    }

    if (seat.state !== "selected") {
        return false;
    }

    seat.state = "available";

    appState.selectedSeats =
        appState.selectedSeats.filter(
            id => id !== seatId
        );

    syncTransactionState();

    refreshSeatUI();

    return true;
}

/* =========================================================
   CLEAR SELECTION
   ========================================================= */

/**
 * Rolls all selected seats back to available.
 */
function clearSelection() {

    if (
        appState.selectedSeats.length === 0
    ) {
        return;
    }

    appState.selectedSeats.forEach(
        seatId => {

            const seat =
                getSeatById(seatId);

            if (
                seat &&
                seat.state === "selected"
            ) {
                seat.state = "available";
            }

        }
    );

    appState.selectedSeats = [];

    syncTransactionState();

    refreshSeatUI();

    if (typeof showToast === "function") {
        showToast(
            "Selection cleared.",
            "info"
        );
    }
}

/* =========================================================
   TRANSACTION VALIDATION
   ========================================================= */

/**
 * Validates all selected seats.
 * Prevents partial booking.
 * @returns {boolean}
 */
function validateTransaction() {

    if (
        appState.selectedSeats.length === 0
    ) {
        return false;
    }

    const uniqueSeats =
        new Set(appState.selectedSeats);

    if (
        uniqueSeats.size !==
        appState.selectedSeats.length
    ) {
        return false;
    }

    for (
        const seatId of appState.selectedSeats
    ) {

        const seat =
            getSeatById(seatId);

        if (!seat) {
            return false;
        }

        if (
            seat.state !== "selected"
        ) {
            return false;
        }

        if (
            !isValidSeatState(
                seat.state
            )
        ) {
            return false;
        }
    }

    return true;
}

/* =========================================================
   TRANSACTION COMMIT
   ========================================================= */

/**
 * Commits entire transaction.
 * ALL seats become booked.
 * Never partial.
 *
 * @returns {boolean}
 */
function commitTransaction() {

    if (
        !validateTransaction()
    ) {

        rollbackTransaction();

        return false;
    }

    const seatsToCommit =
        [...appState.selectedSeats];

    for (
        const seatId of seatsToCommit
    ) {

        const seat =
            getSeatById(seatId);

        if (
            !seat ||
            seat.state !== "selected"
        ) {

            rollbackTransaction();

            return false;
        }
    }

    seatsToCommit.forEach(
        seatId => {

            const seat =
                getSeatById(seatId);

            seat.state = "booked";

        }
    );

    appState.selectedSeats = [];

    transactionState.active = false;

    transactionState.seats = [];

    refreshSeatUI();

    return true;
}

/* =========================================================
   TRANSACTION ROLLBACK
   ========================================================= */

/**
 * Rolls back entire transaction.
 * ALL selected seats become available.
 */
function rollbackTransaction() {

    transactionState.seats.forEach(
        seatId => {

            const seat =
                getSeatById(seatId);

            if (
                seat &&
                seat.state === "selected"
            ) {
                seat.state =
                    "available";
            }

        }
    );

    appState.selectedSeats = [];

    transactionState.active = false;

    transactionState.seats = [];

    refreshSeatUI();

    return true;
}

/* =========================================================
   SEAT CLICK HANDLER
   ========================================================= */

/**
 * Event delegation handler.
 * Attached ONCE to seat grid.
 *
 * @param {MouseEvent} event
 */
function handleSeatClick(event) {

    const seatButton =
        event.target.closest(
            ".seat"
        );

    if (!seatButton) {
        return;
    }

    const seatId =
        seatButton.dataset.seatId;

    if (!seatId) {
        return;
    }

    const seat =
        getSeatById(seatId);

    if (!seat) {
        return;
    }

    if (seat.state === "booked") {

        if (
            typeof showToast ===
            "function"
        ) {
            showToast(
                "This seat has already been booked.",
                "error"
            );
        }

        return;
    }

    if (
        seat.state === "selected"
    ) {

        unselectSeat(seatId);

        return;
    }

    selectSeat(seatId);
}

/* =========================================================
   TRANSACTION STATUS HELPERS
   ========================================================= */

/**
 * Returns transaction status.
 * @returns {Object}
 */
function getTransactionStatus() {

    return {
        active:
            transactionState.active,

        selectedCount:
            appState.selectedSeats.length,

        seats:
            [...appState.selectedSeats]
    };
}

/**
 * Returns true if transaction exists.
 * @returns {boolean}
 */
function hasActiveTransaction() {

    return (
        transactionState.active
    );
}

/* =========================================================
   EVENT DELEGATION BINDING
   ========================================================= */

/**
 * Must be called once during app startup.
 */
function bindSeatEvents() {

    if (!DOM.seatGrid) {
        return;
    }

    DOM.seatGrid.addEventListener(
        "click",
        handleSeatClick
    );
}

/* =========================================================
   PART 4 — PRICING ENGINE, SUMMARY PANEL & MODAL MANAGER
   ========================================================= */

/* =========================================================
   PRICING ENGINE
   ========================================================= */

/**
 * Calculates total booking amount.
 * @returns {number}
 */
function calculateTotal() {

    return getSelectedSeatObjects()
        .reduce(
            (total, seat) =>
                total + seat.price,
            0
        );
}

/**
 * Calculates selected seat count.
 * @returns {number}
 */
function calculateSeatCount() {

    return appState.selectedSeats.length;
}

/**
 * Calculates tier breakdown.
 * @returns {Object}
 */
function calculateBreakdown() {

    const breakdown = {
        VIP: {
            count: 0,
            amount: 0
        },

        CLUB: {
            count: 0,
            amount: 0
        },

        FRONT: {
            count: 0,
            amount: 0
        }
    };

    getSelectedSeatObjects()
        .forEach(seat => {

            breakdown[seat.tier].count++;

            breakdown[seat.tier].amount +=
                seat.price;

        });

    return breakdown;
}

/**
 * Returns pricing summary object.
 * @returns {Object}
 */
function getPricingSummary() {

    return {
        count: calculateSeatCount(),
        total: calculateTotal(),
        breakdown: calculateBreakdown()
    };
}

/* =========================================================
   SUMMARY RENDERERS
   ========================================================= */

/**
 * Renders selected seats.
 */
function renderSelectedSeats() {

    if (!DOM.selectedSeats) {
        return;
    }

    const seats =
        getSelectedSeatObjects();

    if (seats.length === 0) {

        DOM.selectedSeats.innerHTML = `
            <p>No seats selected</p>
        `;

        return;
    }

    DOM.selectedSeats.innerHTML =
        seats.map(
            seat => `
                <span class="selected-seat-chip">
                    ${seat.id}
                </span>
            `
        ).join("");
}

/**
 * Renders seat count.
 */
function renderSeatCount() {

    if (!DOM.seatCount) {
        return;
    }

    DOM.seatCount.textContent =
        calculateSeatCount();
}

/**
 * Renders tier breakdown.
 */
function renderTierBreakdown() {

    if (!DOM.tierBreakdown) {
        return;
    }

    const breakdown =
        calculateBreakdown();

    const tiers =
        Object.entries(breakdown)
            .filter(
                ([, data]) =>
                    data.count > 0
            );

    if (tiers.length === 0) {

        DOM.tierBreakdown.innerHTML = `
            <p>No seats selected</p>
        `;

        return;
    }

    DOM.tierBreakdown.innerHTML =
        tiers.map(
            ([tier, data]) => `
                <div class="tier-breakdown-item">
                    <strong>${tier}</strong>
                    <span>
                        ${data.count} seat(s)
                    </span>
                    <span>
                        ${formatCurrency(data.amount)}
                    </span>
                </div>
            `
        ).join("");
}

/**
 * Renders total amount.
 */
function renderTotalPrice() {

    if (!DOM.totalPrice) {
        return;
    }

    DOM.totalPrice.textContent =
        formatCurrency(
            calculateTotal()
        );
}

/**
 * Master summary renderer.
 */
function renderSummary() {

    renderSelectedSeats();

    renderSeatCount();

    renderTierBreakdown();

    renderTotalPrice();
}

/* =========================================================
   MODAL MANAGER
   ========================================================= */

/**
 * Populates booking modal.
 */
function populateModal() {

    if (
        !DOM.modalSeats ||
        !DOM.modalPrice
    ) {
        return;
    }

    const selectedSeats =
        getSelectedSeatObjects();

    const pricing =
        getPricingSummary();

    /* Seats */

    DOM.modalSeats.innerHTML =
        selectedSeats.length > 0
            ? `
                <div class="modal-seat-list">
                    ${selectedSeats
                .map(
                    seat => `
                                <div>
                                    ${seat.id}
                                    (${seat.tier})
                                </div>
                            `
                )
                .join("")}
                </div>
            `
            : `
                <p>
                    No seats selected
                </p>
            `;

    /* Pricing */

    DOM.modalPrice.innerHTML = `
        <div>
            Seats:
            <strong>
                ${pricing.count}
            </strong>
        </div>

        <div>
            Total:
            <strong>
                ${formatCurrency(
        pricing.total
    )}
            </strong>
        </div>
    `;
}

/**
 * Opens booking modal.
 */
function openModal() {

    if (
        appState.selectedSeats.length === 0
    ) {

        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Select at least one seat before continuing.",
                "warning"
            );
        }

        return;
    }

    populateModal();

    DOM.bookingModal
        ?.classList.remove(
            "hidden"
        );

    DOM.bookingModal
        ?.setAttribute(
            "aria-hidden",
            "false"
        );
}

/**
 * Closes booking modal.
 */
function closeModal() {

    DOM.bookingModal
        ?.classList.add(
            "hidden"
        );

    DOM.bookingModal
        ?.setAttribute(
            "aria-hidden",
            "true"
        );
}

/* =========================================================
   SUMMARY REFRESH INTEGRATION
   ========================================================= */

/**
 * Re-renders all booking UI.
 * Future modules can use this.
 */
function refreshBookingUI() {

    refreshSeatUI();

    renderSummary();
}

/* =========================================================
   PATCHES FOR PART 3
   ========================================================= */

/*
Replace:

refreshSeatUI();

with:

refreshBookingUI();

inside:

selectSeat()
unselectSeat()
clearSelection()
commitTransaction()
rollbackTransaction()

This keeps seat grid and
summary panel synchronized.
*/

/* =========================================================
   INITIAL SUMMARY BOOTSTRAP
   ========================================================= */

/**
 * Initializes summary area.
 */
function initializeSummary() {

    renderSummary();
}

/* =========================================================
   INITIALIZATION PATCH
   ========================================================= */

/*
Update initializeApp()
from Part 2:

function initializeApp() {

    console.log(
        "🎬 Seat Booking Engine Initializing..."
    );

    setupSeatEngine();

    initializeSummary();

    console.log(
        "✅ Seat engine initialized."
    );
}

*/