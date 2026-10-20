# Ajaia Docs — Collaborative Document Platform

> A lightweight, collaborative rich-text document editor inspired by Google Docs, built with Next.js 16, TypeScript, TipTap (ProseMirror), and atomic local persistence.

![Ajaia Docs Banner](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Live Demo & Quick Links

- **Local Development URL:** [http://localhost:3000](http://localhost:3000)
- **Architecture Note:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **AI-Native Workflow Note:** [AI_WORKFLOW.md](AI_WORKFLOW.md)
- **Submission Overview:** [SUBMISSION.md](SUBMISSION.md)
- **Walkthrough Video Script:** [WALKTHROUGH_SCRIPT.md](WALKTHROUGH_SCRIPT.md)

---

## 👥 Seeded Reviewer Test Accounts

To review the collaborative sharing flows and access control, you do **not** need complex auth setup. A 1-click **User Switcher** is present in the top-right corner of the application:

| User | Email | Role | Seed Permissions |
| :--- | :--- | :--- | :--- |
| **Alice Walker** 👩‍💼 | `alice@ajaia.io` | Product Lead | **Owner** of *Ajaia Product Spec*, Editor of *Design Tokens RFC*, Viewer of *System Architecture* |
| **Bob Chen** 👨‍🎨 | `bob@ajaia.io` | Design Lead | **Owner** of *Design Tokens RFC*, Editor of *Ajaia Product Spec* |
| **Charlie Davis** 👨‍💻 | `charlie@ajaia.io` | Engineering Lead | **Owner** of *System Architecture*, Viewer of *Ajaia Product Spec* |

Switching active users instantly re-renders the document dashboard and updates the document editor permissions live (Owner vs. Editor vs. Viewer).

---

## 🛠️ Features Implemented

### 1. Document Creation & Rich Text Editing
- **Create Documents:** Start from blank or from 3 built-in templates (*Weekly Team Sync*, *PRD*, *Sprint Retrospective*).
- **Inline Title Renaming:** Click the document title in the top bar to rename with debounced auto-save.
- **TipTap Rich Text Formatting:**
  - Headings (H1, H2, H3) and Normal Text
  - Bold (`⌘B` / `Ctrl+B`), Italic (`⌘I` / `Ctrl+I`), Underline (`⌘U` / `Ctrl+U`), Strikethrough, Text Highlighter
  - Bulleted Lists and Numbered Lists
  - Blockquotes and Code Blocks
  - Horizontal Dividers
  - Undo / Redo history
- **Debounced Auto-Save:** Background saving with visual indicator:
  - 🟢 *All changes saved to cloud*
  - 🟡 *Unsaved changes* (or `Ctrl+S` / `⌘S` instant trigger)
  - 🔵 *Saving to cloud...*
- **Document Stats:** Real-time word count, character count, and estimated reading time.

### 2. File Upload & Ingestion
- **Document Creation via File Import:**
  - Drag and drop or upload `.txt` and `.md` files directly on the dashboard.
  - Automatically parses markdown syntax (`#` headings, `**bold**`, lists, blockquotes, code blocks) into rich-text TipTap document structure.
- **Document File Attachments:**
  - Collapsible side drawer on every document (`Files (N)`).
  - Drag and drop attachments associated with the document.
  - Supported formats: `.pdf`, `.png`, `.jpg`, `.docx`, `.txt`, `.md`, `.csv` (up to 10MB).
  - Secure local streaming and one-click downloads via `/api/attachments/[filename]`.

### 3. Sharing & Access Control
- **Document Owner Model:** Every document has an explicit owner.
- **Permissions Hierarchy:**
  - **Owner:** Full edit, rename, share management, collaborator revocation, attachment deletion, and document deletion.
  - **Editor:** Can edit content, rename, upload attachments, and view collaborators. Cannot delete the document.
  - **Viewer:** Read-only mode. Content input is disabled, banner displays viewer status, cannot modify or delete content.
- **Share Modal:**
  - Add teammates by email (`alice@ajaia.io`, `bob@ajaia.io`, `charlie@ajaia.io`) or 1-click quick-add pills.
  - Choose role (*Editor* or *Viewer*).
  - Revoke collaborator access in real time.
  - Copy shareable link with visual confirmation.
- **Dashboard Separation:** Distinct tabs for **All Documents**, **My Documents**, and **Shared with Me** with live counters and search filtering.

### 4. Persistence
- **Atomic File-Backed Database:** Document data, user shares, and attachments are persisted in `.data/db.json` via atomic temporary file swapping (`fs.renameSync`) to eliminate partial write corruptions.
- **Survives Server Restarts:** Document state, formatting, revisions, and share records remain fully intact across refreshes and restarts.
- **Seed Auto-Initialization:** If `.data/` is fresh or absent, realistic initial documents and users are populated automatically.

### 5. Exporting
- Export document as **Markdown (`.md`)**
- Export document as **standalone formatted HTML (`.html`)**
- **Print / Save as PDF** via optimized `@media print` styling

---

## 💻 Local Setup & Run Instructions

### Prerequisites
- Node.js `v18+` (Tested on Node `v24.18.0`)
- npm `v9+`

### Installation
```bash
# Clone or navigate to the repository
cd ajaia

# Install dependencies
npm install

# Run the test suite
npm test

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 🧪 Automated Testing

The project includes an automated test suite verifying persistence, access control enforcement, file parsing, and attachment lifecycles:

```bash
npm test
```

### Test Cases Covered:
1. `should initialize and load seed users`
2. `should retrieve documents for active user with correct role annotations`
3. `should create a new document, update word count, and retrieve it`
4. `should enforce editing permissions: Editor can edit, Viewer is blocked (403)`
5. `should allow owner to revoke sharing access`
6. `should convert markdown and plaintext into rich HTML`
7. `should handle document attachments lifecycle (upload, fetch, delete)`

---

## 📁 Project Architecture

```
ajaia/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── attachments/[filename]/route.ts  # Stream attachment files
│   │   │   ├── documents/route.ts               # List & Create docs
│   │   │   ├── documents/[id]/route.ts          # Get, Update, Delete doc
│   │   │   ├── documents/[id]/share/route.ts    # Share permissions management
│   │   │   ├── documents/[id]/attachments/route.ts # Attachment upload & delete
│   │   │   ├── upload/import/route.ts           # File upload import (.md, .txt)
│   │   │   └── users/route.ts                   # Simulated users API
│   │   ├── document/[id]/page.tsx               # Document editor page
│   │   ├── globals.css                          # Custom CSS design system & tokens
│   │   ├── layout.tsx                           # Root layout & SEO tags
│   │   └── page.tsx                             # Dashboard with templates & tabs
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── DocumentEditor.tsx               # TipTap core editor & auto-save
│   │   │   └── EditorToolbar.tsx                # Rich formatting toolbar
│   │   ├── AttachmentPanel.tsx                  # File attachments drawer
│   │   ├── ExportMenu.tsx                       # Export Markdown, HTML, PDF
│   │   ├── ShareModal.tsx                       # Collaboration permissions modal
│   │   └── UserSwitcher.tsx                     # 1-click test user switcher
│   ├── context/
│   │   └── UserContext.tsx                      # Active simulated user state
│   └── lib/
│       ├── db.ts                                # Atomic persistence & seed data
│       ├── markdown-parser.ts                   # Markdown -> HTML parser
│       └── types.ts                             # TypeScript domain models
├── tests/
│   └── db.test.ts                               # Automated test suite
├── .data/                                       # Local storage (gitignored in prod)
│   ├── db.json
│   └── uploads/
├── ARCHITECTURE.md                              # Architecture & tradeoffs note
├── AI_WORKFLOW.md                               # AI tools & engineering judgment note
├── SUBMISSION.md                                # Submission summary & checklist
├── WALKTHROUGH_SCRIPT.md                        # 3-5 minute video script
└── package.json
```
