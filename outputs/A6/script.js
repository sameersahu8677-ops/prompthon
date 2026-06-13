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