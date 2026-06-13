# prompthon-2026

Team : Wreck
participant : Sameer.

## Repository Structure
- outputs/ -> Final soulutions
- chat-logs -> Exported AI conversations
- prompt-log.md -> Prompt tracking

## Problems Attempted

| Problem | Title | Status | Solution Folder |
|----------|----------|----------|----------|
| A1 | Smart Bill Splitter & Expense Tracker | ✅ Completed | outputs/A1 |
| A2 | FlashCard Study Buddy - Leitner Box Systenm | ✅ Completed | outputs/A2 |
| A4 | Smart Budget & Pocket Money Manager | ✅ Completed | outputs/A4 |
| A3 | TBD | ⏳ Pending | outputs/A3 |
| A5 | TBD | ⏳ Pending | outputs/A5 |
| A6 | TBD | ⏳ Pending | outputs/A6 |
| A7 | TBD | ⏳ Pending | outputs/A7 |
| B1 | TBD | ⏳ Pending | outputs/B1 |
| B2 | TBD | ⏳ Pending | outputs/B2 |
| B3 | TBD | ⏳ Pending | outputs/B3 |
| B4 | TBD | ⏳ Pending | outputs/B4 |

### Status Legend

- ✅ Completed
- 🚧 In Progress
- ⏳ Pending
- ❌ Not Attempted

## Problems Attempted

### A1 - Smart Bill Splitter & Expense Tracker

A frontend-only expense splitting and tracking application built using:

* HTML
* CSS
* Vanilla JavaScript

#### Key Features

* Multi-step wizard workflow
* Equal Split
* Percentage Split
* Custom Amount Split
* Tip calculation system
* Expense history using Local Storage
* Dashboard analytics
* Responsive SaaS-style UI
* Validation system
* Financial rounding strategy

#### Architecture

Implemented using a modular structure:

* StateManager
* ExpenseManager
* ParticipantManager
* TipEngine
* SplitEngine
* RoundingEngine
* ValidationEngine
* StorageManager
* NotificationManager
* UIManager

#### Files

```text
outputs/
└── A1/
    ├── index.html
    ├── style.css
    └── script.js
```

#### Documentation

* `prompt-log.md` → Prompt engineering and development log
* `chat-logs/` → Exported AI conversations used during development

#### Notes

The project focuses on:

* Financial accuracy
* Real-world usability
* Responsive design
* Modular architecture
* Frontend-only deployment



## A2 - Flash Card Study Buddy (Leitner Box System)

| Feature | Description |
|----------|-------------|
| Project Type | Flashcard Study Application |
| Learning Method | Leitner Spaced Repetition System |
| Storage | Browser Local Storage |
| Theme Support | Light Mode + Dark Mode |
| Responsiveness | Mobile, Tablet, Desktop |
| Persistence | Automatic Save & Load |

---

## FEATURES

| Feature | Description |
|----------|-------------|
| Deck Management | Create, Rename, Delete, and Open Decks |
| Flashcard Management | Add, Edit, Delete Flashcards |
| Bulk Import | Import multiple flashcards using Question \| Answer format |
| Quiz Mode | Study cards through interactive sessions |
| Leitner System | Automatic promotion and demotion of cards |
| Analytics | Review statistics and box distribution |
| Session Summary | View performance after each study session |
| Dark Mode | Toggle between Light and Dark themes |

---

## LEITNER BOX SYSTEM

| Box | Status |
|------|---------|
| Box 1 | Learning |
| Box 2 | Improving |
| Box 3 | Familiar |
| Box 4 | Strong |
| Box 5 | Mastered |

### Promotion Rules

| From | To |
|--------|------|
| 1 | 2 |
| 2 | 3 |
| 3 | 4 |
| 4 | 5 |
| 5 | 5 |

### Demotion Rules

| From | To |
|--------|------|
| 1 | 1 |
| 2 | 1 |
| 3 | 1 |
| 4 | 2 |
| 5 | 3 |

---

## HOW TO USE

| Step | Action |
|--------|---------|
| 1 | Click Create Deck |
| 2 | Enter Deck Name |
| 3 | Open the Deck |
| 4 | Add Cards or Bulk Import Cards |
| 5 | Click Start Quiz |
| 6 | Read the Question |
| 7 | Click Reveal Answer |
| 8 | Select Got It Right or Got It Wrong |
| 9 | Continue Until Session Ends |
| 10 | Review Session Summary |
| 11 | Check Analytics |

---

## BULK IMPORT FORMAT

| Format |
|----------|
| Capital of France \| Paris |
| Largest Planet \| Jupiter |
| 2 + 2 \| 4 |

One flashcard per line.

---

## ANALYTICS

| Metric | Description |
|----------|-------------|
| Total Reviews | Number of reviewed flashcards |
| Accuracy | Correct answer percentage |
| Mastered Cards | Cards currently in Box 5 |
| Box Distribution | Number of cards in each Leitner Box |

---

## TECHNOLOGIES USED

| Technology | Purpose |
|------------|----------|
| HTML5 | Structure |
| CSS3 | Styling |
| JavaScript (ES6) | Application Logic |
| Local Storage API | Data Persistence |

---

## FILE STRUCTURE

| File | Purpose |
|--------|----------|
| index.html | Application Structure |
| style.css | UI Styling and Responsiveness |
| script.js | Application Logic |

---

## USER FLOW

| Flow |
|--------|
| Create Deck |
| ↓ |
| Add Cards |
| ↓ |
| Start Quiz |
| ↓ |
| Reveal Answer |
| ↓ |
| Right / Wrong |
| ↓ |
| Leitner Box Update |
| ↓ |
| Session Summary |
| ↓ |
| Analytics |

----


## A-4 Smart Budget & Pocket Money Manager

A student-friendly budget management application designed to help first-year college students manage their monthly allowance, track expenses, and avoid overspending.

---

## Features

### Monthly Budget Setup

- Set monthly budget
- Update budget anytime
- View current budget status

### Expense Tracking

Add expenses with:

- Amount
- Category
- Date

Categories:

- Food
- Entertainment
- Books/Stationery

### Budget Overview

View:

- Total Budget
- Total Spent
- Remaining Budget

### Budget Progress Indicator

Track:

- Spending percentage
- Budget utilization
- Remaining allowance

### Spending History

- View all expenses
- Filter by category
- Delete incorrect entries

### Category Analytics

Analyze spending by category with:

- Total amount spent
- Percentage contribution

### Financial Health Status

The system classifies spending as:

- SAFE
- WATCH
- RISK

### Spending Velocity Alert

The application calculates daily spending velocity and predicts future spending trends.

Provides:

- Budget exhaustion prediction
- Days-to-exhaustion estimate
- Suggested daily spending limit
- Overspending warnings

### Early Month Protection

During the first few days of the month, the system collects spending data before generating spending predictions.

### Local Storage Persistence

Data is stored locally in the browser and remains available after refresh.

---

## How To Use

1. Enter your monthly budget.
2. Add expenses with amount, category, and date.
3. Monitor budget usage and analytics.
4. Review spending history.
5. Follow spending velocity recommendations.

---

## Technical Highlights

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Architecture

- Foundation Layer
- Storage & CRUD Layer
- Analytics Engine
- UI Rendering Layer

### Storage Design

Month-aware LocalStorage architecture for managing monthly budgets and expenses.

---

## Accessibility

- Semantic HTML
- Proper form labels
- Keyboard-friendly controls
- Focus states

---

## Responsive Design

Optimized for:

- Mobile
- Tablet
- Desktop

---



## A6 - Personal Portfolio Website

### Overview

A responsive and accessible personal portfolio website built using HTML, CSS, and JavaScript.

The website showcases personal information, technical skills, projects, and contact details while demonstrating modern frontend development practices.

---

## Features

- About Me section
- Skills showcase
- Project portfolio
- Contact form with CAPTCHA validation
- Toast notifications
- Light/Dark theme toggle
- Theme persistence using localStorage
- Responsive design
- Accessibility support

---

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)

---

## Projects Showcased

1. Expense Tracker
2. Flashcard Learning System
3. Bill Splitter

Each project includes:

- Preview image
- Description
- Technology stack
- Live Demo link
- Source Code link

---

## How To Use

1. Open the website.
2. Navigate through About, Skills, Projects, and Contact sections.
3. Explore project demos and source code.
4. Switch between Light and Dark modes.
5. Submit the contact form using the CAPTCHA challenge.

---

## Responsive Design

Optimized for:

- Mobile
- Tablet
- Desktop

---

## Accessibility

- Semantic HTML
- Keyboard navigation
- Focus indicators
- ARIA support
- Accessible forms
- Reduced motion support

---

## Author

**Sameer**

First-Year Developer

Learning:

- HTML
- CSS
- JavaScript
- Python
- Git