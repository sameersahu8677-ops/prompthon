# Prompthon-2026

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
| A6 | Personal Portfolio Website With Interactive Components | ✅ Completed | outputs/A6 |
| A5 | College Fest Event Registration Dashboard | ✅ Completed | outputs/A5 |
| A3 | Gamified Habit Tracker & Daily Routine Planner | ✅ Completed | outputs/A3 |
| A7 | Fitness And Health Tracker App  | ✅ Completed | outputs/A7 |
| B1 | Real-Time Markdown Editor & Live Previewer | ✅ Completed | outputs/B1 |
| B3 | Cinema Matrix Seat Reservation Engine | ✅ Completed | outputs/B3 |
| B4 | Multi-Stage Student Recruitment Tracker | ✅ Completed | outputs/B4 |
| B2 | College Library Inventory & Late-Fee Calculator | ✅ Completed | outputs/B2 |


### Status Legend

- ✅ Completed
- 🚧 In Progress
- ⏳ Pending
- ❌ Not Attempted

## Problems Attempted

# A1 - Smart Bill Splitter & Expense Tracker

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



# A2 - Flash Card Study Buddy (Leitner Box System)

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


# A4 - Smart Budget & Pocket Money Manager

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



# A6 - Personal Portfolio Website

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
--------


# A5 - College Fest Event Registration Dashboard

A responsive frontend dashboard for managing registrations across multiple college fest events. Organizers can register participants, monitor event-wise registrations, and view live registration statistics without refreshing the page.

## Features

### Event Registration
Register participants for:

- Coding Competition
- Sports Tournament
- Music Performance
- Art Exhibition

### Dashboard Statistics
Live dashboard showing:

- Total Registrations
- Coding Competition Count
- Sports Tournament Count
- Music Performance Count
- Art Exhibition Count

### Participant Management
- Scrollable participant list
- Newest registrations shown first
- Registration timestamp tracking
- Automatic dashboard updates

### Validation Rules
- Phone number must be exactly 10 digits
- Email must end with the college domain
- Duplicate registrations are prevented
- Slot conflicts are detected automatically

### User Experience
- Instant validation feedback
- Success and error messages
- Responsive design
- Empty state handling
- Local storage persistence
- No page reloads required

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)

## How to Use

### Register a Participant

1. Enter Student Name
2. Enter Student ID
3. Enter College Email
4. Enter Phone Number
5. Select an Event
6. Click **Register**

### View Dashboard

After registration:

- Statistics update automatically
- Participant list updates instantly
- Data is saved locally in the browser

## Validation Logic

### Phone Validation
Only valid 10-digit phone numbers are accepted.

### Email Validation
Email must belong to the college domain.

### Duplicate Prevention
A student cannot register for the same event more than once.

### Conflict Detection
A student cannot register for two events occurring in the same time slot.

## Event Schedule

| Event | Slot |
|---------|---------|
| Coding Competition | Morning |
| Sports Tournament | Morning |
| Music Performance | Afternoon |
| Art Exhibition | Evening |

## Data Persistence

Registration data is stored using browser Local Storage, allowing data to remain available after page refreshes.

## Responsive Design

Optimized for:

- Desktop
- Tablet
- Mobile

## Project Structure

```text
index.html
style.css
script.js
```

## Key Highlights

- Real-time dashboard updates
- Robust validation system
- Responsive UI
- Accessibility-friendly structure
- Modular JavaScript architecture
- Production-oriented frontend implementation

----------------------------------------------



# A3 - Gamified Habit Tracker & Daily Routine Planner (QuestForge)

QuestForge transforms everyday habits into an RPG-style progression system. Complete daily quests, earn XP, level up your character, maintain streaks, unlock achievements, and protect your HP through consistent habit completion.

---

## Features

### Quest Management
- Create custom daily quests
- Edit existing quests
- Archive quests
- Restore archived quests
- Permanently delete quests

### RPG Progression System
- Earn XP for completing quests
- Automatic level progression
- XP progress tracking
- Character statistics dashboard

### Streak & HP System
- Automatic streak tracking
- Longest streak tracking
- HP penalty for missed habits
- HP recovery after maintaining a 7-day streak
- Fully automated rule enforcement

### Achievement System
- Unlock achievements based on progress
- Achievement showcase section
- Achievement notifications

### Activity Feed
- Tracks important actions
- Quest completions
- XP gains
- Level ups
- HP changes
- Achievement unlocks

### Data Persistence
- Progress automatically saved
- Local storage support
- Progress remains after page refresh

---

## How To Use

### 1. Create a Quest
Click **"Add Quest"** and enter:
- Quest name
- Difficulty level

### 2. Complete Quests
Mark quests as completed using the checkbox.

### 3. Earn Rewards
Completing quests:
- Grants XP
- Increases progress
- Helps level up

### 4. Maintain Streaks
Complete your daily quests consistently to:
- Build streaks
- Protect HP
- Recover lost HP

### 5. Manage Quests
- Edit quests when needed
- Archive inactive quests
- Restore archived quests later
- Permanently delete unwanted quests

---

## Streak & HP Rules

### HP Penalty
If any quest is missed for **two consecutive days**:
- Current streak resets to 0
- Lose 1 HP
- HP never drops below 0

### HP Recovery
Maintaining an unbroken **7-day streak**:
- Restores 1 HP
- HP cannot exceed maximum HP

---

## Statistics Dashboard

Track:
- Current Level
- Total XP
- Current HP
- Active Streak
- Longest Streak
- Daily Progress

---

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage

---

## Project Structure

```text
index.html
style.css
script.js
```

---

## Notes

- No account required
- No backend required
- Works entirely in the browser
- Designed for non-technical users
- Ready for deployment on any static hosting platform

-----------------------------------------------------------


# A7 - Fitness & Health Tracker

A personal health and wellness tracking web application that helps users monitor daily activity, nutrition, hydration, sleep, and workouts in one place. The app provides real-time health insights, weekly trend analysis, and smart alerts to encourage healthier habits.

## Features

### Daily Activity Tracking
- Log daily step count
- Track active minutes
- Record distance covered
- Goal-based activity status indicators

### Nutrition Tracking
- Add meals with calorie information
- Monitor daily calorie intake
- Compare consumption against calorie goals
- View remaining calories

### Water Intake Tracking
- Log daily water consumption
- Visual hydration progress indicator
- Customizable water goals

### Sleep Monitoring
- Record hours slept
- Automatic "Rest Needed" warning for sleep below 6 hours
- Sleep status tracking

### Workout Logging
- Record workout type
- Track workout duration
- Monitor calories burned
- View workout summaries

### Health Dashboard
- Single-page overview of all health metrics
- Color-coded status indicators
- Dynamic health score calculation
- Quick health insights

### Weekly Trend Analysis
- Average daily steps
- Average calorie intake
- Average sleep duration
- Total workouts completed
- 7-day trend tracking

### Smart Health Alerts
- Detects low activity patterns
- Generates health recommendations
- Dynamic alert generation from actual user data

### Data Management
- Local storage persistence
- Export health data as JSON
- Reset application data
- Multi-day health history tracking

## How To Use

### Activity Tracking
1. Enter steps, active minutes, and distance.
2. Click **Update Activity**.
3. Dashboard updates automatically.

### Nutrition Tracking
1. Enter meal name and calories.
2. Click **Add Meal**.
3. Nutrition summary updates instantly.

### Water Tracking
1. Enter glasses of water consumed.
2. Click **Update Water**.
3. Hydration progress updates automatically.

### Sleep Tracking
1. Enter sleep duration.
2. Click **Update Sleep**.
3. Sleep status and warnings update automatically.

### Workout Tracking
1. Select workout type.
2. Enter duration and calories burned.
3. Click **Add Workout**.
4. Workout statistics update instantly.

### Goal Management
1. Configure calorie, water, and activity goals.
2. Save settings.
3. Status indicators adjust automatically.

## Smart Features

- Health Score System
- Quick Daily Insights
- Weekly Trend Analytics
- Smart Low Activity Alerts
- Timeline Activity Tracking
- Goal-Based Progress Monitoring
- Export & Backup Support

## Storage

All data is stored locally in the browser using Local Storage. No external database or account is required.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage API

## Project Highlights

- Modular architecture
- Responsive design
- Real-world fitness tracking workflow
- Dynamic analytics and alerts
- Persistent health records
- Beginner-friendly interface

----------------------------------------

# B1 - RealTime Markdown Editor & Live Previewer

A secure Markdown editor that provides real-time preview, automatic saving, and HTML export functionality.

---

## Features

- Real-time Markdown preview
- Split-screen editor and preview
- Supports:
  - H1, H2, H3
  - Bold
  - Italic
  - Ordered Lists
  - Unordered Lists
  - Paragraphs
  - Inline Code
- XSS-safe rendering
- Auto-save with Local Storage
- Copy rendered HTML
- Export as HTML file
- Toast notifications
- Responsive design

---

## How to Use

1. Write Markdown in the editor.
2. View rendered output instantly.
3. Copy generated HTML using **Copy HTML**.
4. Download output using **Export HTML**.
5. Clear content using **New Document**.

---

## Security

All user input is sanitized before rendering.

Protected against:

- Script Injection
- Malicious HTML
- XSS Attacks

---

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage API
- Clipboard API

---

## Project Structure

```text
index.html
style.css
script.js
```

---

## Responsive Support

- Desktop
- Tablet
- Mobile

---

## Future Improvements

- Extended Markdown Support
- Theme Toggle
- Markdown File Import

--------------------------------

# B3 - Cinema Matrix Seat Reservation Engine

## Overview

A premium cinema-style seat booking platform that simulates real-world reservation workflows with transaction integrity, booking history, analytics, and persistent storage. Users can select seats, review pricing, confirm bookings, and manage reservations through an interactive interface.

---

## Features

### Seat Booking
- Dynamic 2D seat grid
- VIP, Club, and Front Row tiers
- Automatic seat numbering and pricing
- Color-coded seat states:
  - 🟢 Available
  - 🟡 Selected
  - 🔴 Booked

### Booking Workflow
- Multi-seat selection
- Real-time pricing summary
- Booking confirmation modal
- Permanent reservation after confirmation
- Clear selection and rollback support

### Transaction Integrity
- Batch transaction processing
- Validation before commit
- Commit and rollback workflow
- Ghost reservation prevention
- Booked seat protection

### Analytics & History
- Revenue tracking
- Occupancy percentage
- Seat statistics
- Booking count
- Persistent booking history

### Persistence
- LocalStorage integration
- Seat state restoration
- Revenue persistence
- Booking history persistence

### User Experience
- Premium cinema-inspired UI
- Responsive design
- Toast notifications
- Interactive seat feedback
- Accessibility support

---

## Technical Highlights

- Modular architecture
- Centralized state management
- Dynamic rendering system
- Event delegation
- Transaction-safe booking engine
- Real-time analytics updates

---

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage API

---

## Problem Statement Coverage

- Dynamic seat grid generation
- Pricing tier support
- Color-coded seat states
- Booking confirmation workflow
- Multi-seat booking support
- Batch transaction isolation
- Red seat rejection
- Yellow seat rollback
- Permanent booking commit
- No ghost reservations

---

## Deployment

Deployable on:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Any static web host

---

## Status

✅ Fully Functional  
✅ Transaction Safe  
✅ Persistent Storage Enabled  
✅ Analytics & History Enabled  
✅ Responsive Design  

-----------------------------------------

# B4 - Multi-Stage Student Recruitment Tracker

A Kanban-based Applicant Tracking System (ATS) for managing student recruitment pipelines for clubs, societies, internships, and placement drives.

---

## Features

### Candidate Management
- Add, edit, delete, and view candidates
- Unique roll number validation
- Candidate activity history

### Recruitment Pipeline
- Applied
- Interviewing
- Technical Test
- Offered
- Rejected

### Automated ATS Rules
- Technical Test requires score entry (0–100)
- Score below 70 → Auto Rejected
- Rejected candidates are permanently locked
- Offered stage requires confirmation

---

## Dashboard & Analytics

- Total Candidates
- Stage-wise Counts
- Average Score
- Offer Rate
- Rejection Rate

---

## Search & Filtering

- Search by name or roll number
- Filter by role or stage
- Sort by newest, oldest, or highest score

---

## Candidate Details

- Candidate information
- Technical score
- Current stage
- Activity timeline
- Creation and update history

---

## Data Persistence

Uses Local Storage to preserve:
- Candidates
- Scores
- Pipeline progress
- Activity history

---

## Architecture

```text
Store
↓
Services
↓
Renderers
↓
Controllers
↓
Bootstrap
```

### Core Services
- ValidationService
- CandidateService
- ScoringService
- TransitionService
- LockService
- AnalyticsService
- StorageService
- HistoryService

---

## ATS Workflow

```text
Applied
↕
Interviewing

Interviewing
↓ Score Submission

Score ≥ 70
↓
Technical Test
↓ Confirmation
Offered

Score < 70
↓
Rejected
↓
Locked Forever
```

---

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage API

---

## Project Highlights

- Real-world ATS workflow
- Automated business rules
- Modular architecture
- Persistent state management
- Analytics dashboard
- Audit timeline
- User-friendly interface

---

## Status

✅ Functional ATS Workflow  
✅ Automated Gate Logic  
✅ Kanban Pipeline  
✅ Analytics Dashboard  
✅ Local Storage Persistence  

-------------------------------------------


# B2 - College Library Inventory & Late Fee Calculator

A browser-based Library Management System.

Manage library inventory, issue books, process returns, track loans, and automatically calculate overdue fines.

---

## 🚀 Features

### 📖 Inventory Management
- Add, edit, and delete books
- Search by Book ID, Title, or Author
- Track:
  - Total Copies
  - Borrowed Copies
  - Available Copies
- Status indicators:
  - Available
  - Low Stock
  - Out Of Stock

### 🔄 Book Checkout
- Issue books to students
- Assign due dates
- Automatic stock deduction
- Prevent checkout when copies are unavailable

### ↩️ Book Returns
- Search active loans
- Return borrowed books
- Restore inventory automatically
- Generate loan history records

### 💰 Fine Calculation
Fine Structure:

| Overdue Days | Rate |
|-------------|------|
| 1 - 7 Days | ₹1/day |
| 8+ Days | ₹2.50/day |

Example:

```text
10 Days Overdue

7 × ₹1
+
3 × ₹2.50

= ₹14.50
```

### 📊 Dashboard
Displays:
- Total Books
- Available Books
- Borrowed Books
- Active Loans
- Overdue Loans
- Total Fine Collected

### 📝 Loan History
Tracks:
- Loan ID
- Book Details
- Student ID
- Borrow & Return Dates
- Overdue Days
- Fine Paid

### 💾 Persistence
Uses localStorage to preserve:
- Books
- Active Loans
- Loan History
- Activity Logs

---

## 🏗️ Project Structure

```text
project/
│
├── index.html
├── style.css
└── script.js
```

---

## 🔒 Validation Rules

### Books
- Title required
- Author required
- Copies ≥ 1

### Checkout
- Book must exist
- Copies must be available
- Student ID required
- Due date required

### Returns
- Loan must exist
- Fine calculated automatically

---

## 🎨 Design

Theme: **Calm Library Aesthetic**

Colors:
- Beige
- Warm Brown
- Cream White
- Muted Gold

Focused on simplicity, readability, and ease of use for non-technical users.

---

## 🎯 B2 Coverage

| Requirement | Status |
|------------|---------|
| Inventory Management | ✅ |
| Checkout System | ✅ |
| Return System | ✅ |
| Fine Calculation | ✅ |
| Loan History | ✅ |
| Dashboard | ✅ |
| Search | ✅ |
| Persistence | ✅ |

---

## 🏆 Highlights

- Fully browser-based
- No database required
- Persistent storage
- Automatic fine calculation
- Library-themed UI
- Modular structure
- Easy deployment

------------------------------