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

/* ==========================================
   FORM VALIDATION
========================================== */

const contactForm = document.getElementById("contact-form");

function validateName(name) {
    return name.trim().length >= 2;
}

function validateEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email.trim());
}

function validateSubject(subject) {
    return subject.trim().length >= 3;
}

function validateMessage(message) {
    return message.trim().length >= 10;
}

function getFormData() {
    if (!contactForm) return null;

    const formData = new FormData(contactForm);

    return {
        name: formData.get("name")?.trim() || "",
        email: formData.get("email")?.trim() || "",
        subject: formData.get("subject")?.trim() || "",
        message: formData.get("message")?.trim() || ""
    };
}

function validateForm() {
    const formData = getFormData();

    if (!formData) {
        showError("Contact form not found.");
        return false;
    }

    if (!validateName(formData.name)) {
        showError(
            "Please enter a valid name."
        );
        return false;
    }

    if (!validateEmail(formData.email)) {
        showError(
            "Please enter a valid email address."
        );
        return false;
    }

    if (!validateSubject(formData.subject)) {
        showError(
            "Please enter a valid subject."
        );
        return false;
    }

    if (!validateMessage(formData.message)) {
        showError(
            "Message must contain at least 10 characters."
        );
        return false;
    }

    if (!validateCaptcha()) {
        showError(
            "Incorrect CAPTCHA answer."
        );
        return false;
    }

    return true;
}

/* ==========================================
   CONTACT FORM HANDLER
========================================== */

function resetContactForm() {
    if (!contactForm) return;

    contactForm.reset();

    clearNotification();

    resetCaptcha();
}

function handleFormSubmission(event) {
    event.preventDefault();

    clearNotification();

    const isFormValid = validateForm();

    if (!isFormValid) {
        return;
    }

    showSuccess(
        "Thank you! Your message has been submitted successfully."
    );

    resetContactForm();
}

function initializeContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener(
        "submit",
        handleFormSubmission
    );
}

/* ==========================================
   NAVIGATION ENHANCEMENTS
========================================== */

const navLinks = document.querySelectorAll(
    '.nav-link[href^="#"]'
);

const sections = document.querySelectorAll(
    "main section[id]"
);

function clearActiveNavigation() {
    navLinks.forEach((link) => {
        link.classList.remove("active");
    });
}

function updateActiveNavigation() {
    const scrollPosition =
        window.scrollY + 150;

    let currentSectionId = "";

    sections.forEach((section) => {
        const sectionTop =
            section.offsetTop;

        const sectionHeight =
            section.offsetHeight;

        if (
            scrollPosition >= sectionTop &&
            scrollPosition <
            sectionTop + sectionHeight
        ) {
            currentSectionId =
                section.getAttribute("id");
        }
    });

    if (!currentSectionId) return;

    clearActiveNavigation();

    const activeLink =
        document.querySelector(
            `.nav-link[href="#${currentSectionId}"]`
        );

    if (activeLink) {
        activeLink.classList.add("active");
    }
}

function initializeNavigation() {
    if (
        navLinks.length === 0 ||
        sections.length === 0
    ) {
        return;
    }

    updateActiveNavigation();

    window.addEventListener(
        "scroll",
        updateActiveNavigation
    );
}