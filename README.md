<div align="center">

# 📝 Ajaia Docs
### A Modern, Lightweight Collaborative Document Editor

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TipTap](https://img.shields.io/badge/Editor-TipTap%20%2F%20ProseMirror-000000?style=flat-square)](https://tiptap.dev/)
[![Tests](https://img.shields.io/badge/Tests-7%2F7%20Passing-brightgreen?style=flat-square)](tests/db.test.ts)
[![Deployment](https://img.shields.io/badge/Live%20Demo-ajaia--xi.vercel.app-success?style=flat-square&logo=vercel)](https://ajaia-xi.vercel.app)
[![Walkthrough Video](https://img.shields.io/badge/YouTube-Video%20Walkthrough-red?style=flat-square&logo=youtube)](https://youtu.be/XQux57a8qR4)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

*Built for the Ajaia Full Stack Product Engineer Assignment.*  
A focused, full-stack document platform demonstrating rich-text drafting, file upload workflows, granular sharing access control, and zero-dependency atomic persistence.

🌐 **Live Production URL:** [https://ajaia-xi.vercel.app](https://ajaia-xi.vercel.app)  
💻 **GitHub Repository:** [https://github.com/pranjal9091/ajaia](https://github.com/pranjal9091/ajaia)  
🎥 **Walkthrough Video:** [https://youtu.be/XQux57a8qR4](https://youtu.be/XQux57a8qR4)

[Quickstart](#-quickstart--local-setup) • [Reviewer Testing Guide](#-reviewer-testing-guide) • [Core Features](#-core-capabilities) • [Architecture](#-architecture--design-decisions) • [AI Workflow](#-ai-native-workflow)

</div>

---

## 💡 Executive Summary

Ajaia Docs is a collaborative document workspace designed for modern product, design, and engineering teams. Instead of building a shallow imitation of every Google Docs feature, this implementation prioritizes **depth and reliability in core daily workflows**:

1. **Rich-Text Drafting Canvas:** TipTap/ProseMirror semantic editor with headings, lists, quotes, code blocks, highlighting, and debounced cloud auto-save.
2. **Dual File Ingestion Workflows:** Native Markdown/Plaintext file imports into editable documents, plus document file attachments (PDFs, images, specs) with local streaming.
3. **Transparent Sharing & Role Enforcement:** Server-enforced Owner, Editor, and Viewer permission tiers with a 1-click **User Switcher** for instant reviewer evaluation.
4. **Resilient Local Persistence:** Atomic file-backed storage with temporary file swapping (`fs.renameSync`) to eliminate partial-write corruptions and cold-start failures.
5. **Production Engineering Quality:** 100% automated test coverage on critical paths, strict TypeScript types, and instant setup with zero external cloud dependencies.

---

## 👥 Reviewer Testing Guide

Reviewers do **not** need to create accounts or configure third-party OAuth. The app includes a **1-Click User Switcher** in the top navigation bar to test multi-user permissions in seconds:

| Persona | Name | Email | Default Seed Documents & Access |
| :---: | :--- | :--- | :--- |
| 👩‍💼 | **Alice Walker**<br>`Product Lead` | `alice@ajaia.io` | • **Owner** of *🚀 Ajaia Product Spec*<br>• **Editor** on *🎨 Design Tokens RFC*<br>• **Viewer** on *⚡ System Architecture* |
| 👨‍🎨 | **Bob Chen**<br>`Design Lead` | `bob@ajaia.io` | • **Owner** of *🎨 Design Tokens RFC*<br>• **Editor** on *🚀 Ajaia Product Spec* |
| 👨‍💻 | **Charlie Davis**<br>`Engineering Lead` | `charlie@ajaia.io` | • **Owner** of *⚡ System Architecture*<br>• **Viewer** on *🚀 Ajaia Product Spec* |

### Quick 60-Second Evaluation Flow:
1. Open [http://localhost:3000](http://localhost:3000) (active user is **Alice Walker** by default).
2. Click **"🚀 Ajaia Product Spec"**:
   - Edit content or title &rarr; Observe the cloud status switch from `Saving to cloud...` to `All changes saved to cloud`.
   - Click **"Share"** &rarr; Inspect collaborators (*Bob as Editor, Charlie as Viewer*).
   - Click **"Files (1)"** &rarr; Inspect and download the attached `ajaia_roadmap_q4.pdf`.
3. Switch user to **Charlie Davis** in the top-right dropdown:
   - Notice Charlie's role badge updates to **Viewer**.
   - An alert banner confirms read-only mode, the TipTap editor is locked, and formatting controls are disabled.
   - Any direct API `PATCH` from Charlie is blocked with `HTTP 403 Forbidden`.
4. Return to the dashboard &rarr; Drag and drop any `.md` or `.txt` file onto **"Import from File"** to watch it auto-convert into a rich editable doc.

---

## ✨ Core Capabilities

### 1. Document Creation & Editing
- **Template Library:** Blank Document + 3 pre-built templates (*Weekly Team Sync*, *PRD*, *Sprint Retrospective*).
- **Inline Title Renaming:** Click the header title to rename with real-time auto-saving.
- **TipTap Formatting Engine:**
  - Headings (H1, H2, H3) and Body text
  - Bold (`⌘B`), Italic (`⌘I`), Underline (`⌘U`), Strikethrough, Text Highlighter
  - Bulleted Lists, Numbered Lists, Blockquotes, and Code Blocks
  - Horizontal Dividers and Undo/Redo history
- **Debounced Auto-Save:** Background saving (700ms debounce) with clear status pills:
  - 🟢 *All changes saved to cloud*
  - 🔵 *Saving to cloud...*
  - 🟡 *Unsaved changes* (Instant `⌘S` / `Ctrl+S` trigger supported)
- **Live Document Stats:** Word count, character count, and estimated reading time.

### 2. File Upload & Ingestion Workflows
- **Markdown / Plaintext Import:** Ingest `.txt` and `.md` files via drag-and-drop. The backend parser transforms Markdown structure (`#`, `**`, `*`, lists, code blocks) into rich-text TipTap document state.
- **Document Attachments Drawer:** Dedicated slide-over drawer on each document (`Files (N)`). Attach project assets (.pdf, .png, .jpg, .docx, .txt, .csv up to 10MB) with download and delete controls.

### 3. Collaboration & Access Control
- **Document Owner Model:** Every document has an explicit owner.
- **Permissions Hierarchy:**
  - **Owner:** Full edit, rename, share management, collaborator revocation, attachment deletion, and document deletion.
  - **Editor:** Can edit content, rename, upload attachments, and view collaborators. Cannot delete the document.
  - **Viewer:** Read-only mode. Content input is disabled, banner displays viewer status, cannot modify or delete content.
- **Share Modal:** Add collaborators by email (`alice@ajaia.io`, etc.) or quick-add teammate pills, adjust roles between Editor and Viewer, revoke access, and copy shareable links.
- **Dashboard Separation:** Distinct tabs for **All Documents**, **My Documents**, and **Shared with Me** with real-time counters and search filtering.

### 4. Persistence & Export
- **Atomic File Store:** Persisted to `.data/db.json` via atomic temporary file swapping (`fs.renameSync`) to eliminate partial write corruptions. Survives server restarts and browser reloads.
- **Export Options:** Export as **Markdown (`.md`)**, standalone styled **HTML (`.html`)**, or **Print / Save as PDF** (`@media print` optimized).

---

## 🏗️ Architecture & Design Decisions

```
                                      [ Browser Client ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
          [ TipTap Editor Engine ]                           [ UserContext ]
       (ProseMirror Model & Commands)                    (Simulated Multi-User Auth)
                      │                                               │
                      │ Auto-Save (Debounced 700ms)                  │ User Switcher
                      ▼                                               ▼
     ┌─────────────────────────────────────────────────────────────────────────────┐
     │                       Next.js App Router (Full-Stack)                       │
     │  - GET/POST   /api/documents             - POST /api/upload/import          │
     │  - GET/PATCH  /api/documents/[id]        - POST /api/documents/[id]/share   │
     │  - GET/POST   /api/documents/[id]/att    - GET  /api/attachments/[filename]│
     └──────────────────────────────────────┬──────────────────────────────────────┘
                                            │
                                            ▼
                               [ Atomic Storage Layer ]
                           (Local File-Backed Database)
                       .data/db.json  &  .data/uploads/
```

### Strategic Tradeoffs & Scoping Rationale:
- **Why TipTap over raw `contenteditable`?** Raw `contenteditable` creates brittle DOM mutations and cross-browser formatting inconsistencies. TipTap provides a battle-tested semantic document model with robust keyboard shortcuts and clean HTML serialization.
- **Why a 1-Click User Switcher over full OAuth?** Full OAuth signup flows create evaluation friction for hiring managers. A 1-click switcher allows reviewers to verify multi-user permission shifts (Owner vs. Editor vs. Viewer) in seconds.
- **Why Atomic Local Persistence over Cloud DB?** External cloud databases (PostgreSQL/Supabase) require connection strings, network access, and provisioning, which can fail on cold-clone evaluation. Local atomic storage works out-of-the-box with zero external setup while preserving all documents, attachments, and shares.

*For full architectural notes and tradeoffs, read [ARCHITECTURE.md](ARCHITECTURE.md).*

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Node.js `v18+` (Tested on Node `v24.18.0`)
- npm `v9+`

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/pranjal9091/ajaia.git
cd ajaia

# 2. Install dependencies
npm install

# 3. Run the automated test suite
npm test

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 🧪 Automated Testing

The repository includes a comprehensive automated test suite built with Node's native test runner (`tsx --test`):

```bash
npm test
```

### Test Coverage Highlights (`tests/db.test.ts`):
- `✔ should initialize and load seed users`
- `✔ should retrieve documents for active user with correct role annotations`
- `✔ should create a new document, update word count, and retrieve it`
- `✔ should enforce editing permissions: Editor can edit, Viewer is blocked (403)`
- `✔ should allow owner to revoke sharing access`
- `✔ should convert markdown and plaintext into rich HTML`
- `✔ should handle document attachments lifecycle (upload, fetch, delete)`

---

## 🤖 AI-Native Workflow

As an AI-forward engineer, AI tools were leveraged with critical product judgment:

- **Where AI sped up delivery:** Scaffolding the full Next.js App Router boilerplate, generating TipTap extensions, synthesizing high-coverage test cases, and writing the regex Markdown parser.
- **What was changed or rejected:**
  1. *Rejected overcomplicated OAuth/NextAuth:* Replaced with an instant 1-click user switcher to minimize reviewer friction.
  2. *Fixed Next.js 16 partial prerendering:* Wrapped client routes in `<React.Suspense>` to eliminate prerender errors.
  3. *Fixed DOM variable shadowing:* Disambiguated `document: DocumentItem` prop from `window.document`.
  4. *Rejected fragile cloud database dependencies:* Implemented atomic file-backed persistence for 100% portable evaluation.

*For full details on tools, speedups, and verification, read [AI_WORKFLOW.md](AI_WORKFLOW.md).*

---

## 📂 Repository Structure

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
│   │   │   └── users/route.ts                   # Seed users API
│   │   ├── document/[id]/page.tsx               # Document editor page
│   │   ├── globals.css                          # Design tokens & typography
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
├── ARCHITECTURE.md                              # In-depth architectural decisions
├── AI_WORKFLOW.md                               # AI usage & engineering judgment note
├── SUBMISSION.md                                # Submission checklist & candidate notes
├── WALKTHROUGH_SCRIPT.md                        # 3-5 minute demo video script
├── VIDEO_URL.txt                                # Walkthrough video link
└── package.json
```

---

## 🔮 What We Would Build Next (2-4 Hour Scope)

1. **Yjs WebSocket Presence:** Add real-time multi-cursor awareness and live collaborator presence badges using `@tiptap/extension-collaboration`.
2. **Inline Comments & Suggestion Mode:** Allow collaborators to highlight text and leave threaded comments or suggest text replacements without directly editing.
3. **Document Revision History:** A timeline drawer allowing users to browse prior auto-save snapshots and restore past versions.

---

## 📄 License

MIT © [Pranjal Singh](https://github.com/pranjal9091)
