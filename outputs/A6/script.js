"use strict";

const themeToggle = document.getElementById("theme-toggle");

const THEME_STORAGE_KEY = "portfolio-theme";

function updateThemeButton(theme) {
    if (!themeToggle) return;

    const isDarkTheme = theme === "dark";

    themeToggle.textContent = isDarkTheme
        ? "☀ Light Mode"
        : "🌙 Dark Mode";

    themeToggle.setAttribute(
        "aria-label",
        isDarkTheme
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}

function applyTheme(theme) {
    const validTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute(
        "data-theme",
        validTheme
    );

    updateThemeButton(validTheme);
}

function initializeTheme() {
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem(
            THEME_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Unable to access localStorage:",
            error
        );
    }

    if (savedTheme === "light" || savedTheme === "dark") {
        applyTheme(savedTheme);
        return;
    }

    const currentTheme =
        document.documentElement.getAttribute(
            "data-theme"
        ) || "light";

    applyTheme(currentTheme);
}

function toggleTheme() {
    const currentTheme =
        document.documentElement.getAttribute(
            "data-theme"
        ) || "light";

    const nextTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";

    applyTheme(nextTheme);

    try {
        localStorage.setItem(
            THEME_STORAGE_KEY,
            nextTheme
        );
    } catch (error) {
        console.error(
            "Unable to save theme preference:",
            error
        );
    }
}

if (themeToggle) {
    themeToggle.addEventListener(
        "click",
        toggleTheme
    );
}

/* ==========================================
   CAPTCHA SYSTEM
========================================== */

const captchaQuestion = document.getElementById("captcha-question");
const captchaAnswer = document.getElementById("captcha-answer");

let currentCaptchaAnswer = null;

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCaptcha() {
    if (!captchaQuestion) return;

    const firstNumber = generateRandomNumber(1, 20);
    const secondNumber = generateRandomNumber(1, 20);

    currentCaptchaAnswer = firstNumber + secondNumber;

    captchaQuestion.textContent =
        `What is ${firstNumber} + ${secondNumber}?`;
}

function validateCaptcha() {
    if (!captchaAnswer) return false;

    const userAnswer = Number.parseInt(
        captchaAnswer.value.trim(),
        10
    );

    return userAnswer === currentCaptchaAnswer;
}

function resetCaptcha() {
    if (captchaAnswer) {
        captchaAnswer.value = "";
    }

    generateCaptcha();
}

/* ==========================================
   NOTIFICATION SYSTEM
========================================== */

const formMessage = document.getElementById("form-message");

function clearNotification() {
    if (!formMessage) return;

    formMessage.textContent = "";
    formMessage.className = "notification";
}

function showNotification(message, type = "info") {
    if (!formMessage) return;

    clearNotification();

    formMessage.textContent = message;

    formMessage.classList.add(
        type === "success"
            ? "notification-success"
            : type === "error"
                ? "notification-error"
                : "notification-info"
    );
}

function showSuccess(message) {
    showNotification(message, "success");
}

function showError(message) {
    showNotification(message, "error");
}

function showInfo(message) {
    showNotification(message, "info");
}