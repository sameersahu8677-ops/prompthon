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
| A2 | TBD | ⏳ Pending | outputs/A2 |
| A3 | TBD | ⏳ Pending | outputs/A3 |
| A4 | TBD | ⏳ Pending | outputs/A4 |
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