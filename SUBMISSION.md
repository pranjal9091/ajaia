# Submission Checklist & Candidate Notes

**Candidate Name:** Pranjal Singh  
**Role:** Full Stack Product Engineer  
**Company:** Ajaia  
**Repository Location:** [https://github.com/pranjal9091/ajaia](https://github.com/pranjal9091/ajaia)  
**Live Deployed URL:** [https://ajaia-xi.vercel.app](https://ajaia-xi.vercel.app)  
**Local Preview URL:** [http://localhost:3000](http://localhost:3000)  
**Walkthrough Video Script:** [WALKTHROUGH_SCRIPT.md](WALKTHROUGH_SCRIPT.md)  
**Walkthrough Video Link:** [VIDEO_URL.txt](VIDEO_URL.txt)  

---

## 📦 What Is Included In This Submission

1. **Complete Full-Stack Source Code:**
   - Next.js 16 (App Router), TypeScript, React 19.
   - TipTap rich text editor integration (ProseMirror based).
   - Atomic file-backed persistence service with zero external infrastructure dependencies.
   - Full REST API route handlers for documents, shares, attachments, and file imports.
   - Clean, custom CSS design system inspired by Google Docs and Linear.
2. **Comprehensive Documentation:**
   - [`README.md`](README.md): Setup, quickstart, seed account matrix, and feature highlights.
   - [`ARCHITECTURE.md`](ARCHITECTURE.md): Architectural decisions, component decomposition, tradeoff rationale, and future extensions.
   - [`AI_WORKFLOW.md`](AI_WORKFLOW.md): Critical analysis of AI tooling usage, productivity acceleration, rejected outputs, and reliability verification.
   - [`SUBMISSION.md`](SUBMISSION.md): Submission overview, feature status, test credentials, and future scope.
   - [`WALKTHROUGH_SCRIPT.md`](WALKTHROUGH_SCRIPT.md): Complete script and visual cues for the 3-5 minute demo walkthrough video.
   - [`VIDEO_URL.txt`](VIDEO_URL.txt): Recorded video link placeholder.
3. **Automated Test Suite:**
   - Located at `tests/db.test.ts`.
   - Run anytime via `npm test`. 7/7 test suites passing in <100ms.

---

## 👥 Test Credentials & Reviewer Flow

No registration or credential login is required. Use the **User Switcher** in the top navigation bar:

| User | Role / Title | Email | Access Permissions on Seed Docs |
| :--- | :--- | :--- | :--- |
| **Alice Walker** 👩‍💼 | Product Lead | `alice@ajaia.io` | **Owner** of *Ajaia Product Spec*, Editor of *Design Tokens RFC*, Viewer of *System Architecture* |
| **Bob Chen** 👨‍🎨 | Design Lead | `bob@ajaia.io` | **Owner** of *Design Tokens RFC*, Editor of *Ajaia Product Spec* |
| **Charlie Davis** 👨‍💻 | Engineering Lead | `charlie@ajaia.io` | **Owner** of *System Architecture*, Viewer of *Ajaia Product Spec* |

### Quick Verification Steps for Reviewers:
1. **Open [http://localhost:3000](http://localhost:3000)**.
2. Notice Alice Walker is active by default. You will see *All Documents (3)*, *My Documents (1)*, and *Shared with Me (2)*.
3. Click on **"🚀 Ajaia Product Spec"**. Notice:
   - Alice is Owner.
   - Cloud status pill shows **"All changes saved to cloud"**.
   - Edit the title or content. Notice debounced saving indicator turns to **"Saving to cloud..."** and returns to **"Saved"**.
   - Click **"Share"**: View Bob (Editor) and Charlie (Viewer). Copy share link.
   - Click **"Files (1)"**: View attached `ajaia_roadmap_q4.pdf` and download it.
4. Switch to **Charlie Davis** in the top-right switcher:
   - Notice Charlie's role badge on this doc changes to **"Viewer"**!
   - An alert banner appears: *"Viewer Mode: You can view, read, and export this document. Only Owner and Editors can edit content."*
   - The editor is automatically disabled (read-only), and toolbar is locked.
   - Any API edit attempt is rejected with HTTP 403 Forbidden.
5. Return to Home, and click **"Import from File"** to upload any `.md` or `.txt` file. Notice it is instantly converted into a live, rich-text editable document!

---

## 🚀 Feature Status Matrix

### ✅ What is Fully Working:
- [x] **Document Creation:** Blank document + 3 structured templates (*Team Sync*, *PRD*, *Sprint Retro*).
- [x] **Document Renaming:** Inline title input with auto-save.
- [x] **Rich Text Editing:** Full TipTap ProseMirror formatting (H1, H2, H3, Bold, Italic, Underline, Strike, Highlight, Bullet Lists, Numbered Lists, Blockquotes, Code Blocks, Dividers, Undo/Redo).
- [x] **Debounced Auto-Save & Manual Save:** Auto-saves edits to disk with cloud status indicator; supports `Ctrl+S` / `⌘S`.
- [x] **File Import Ingestion:** Direct upload of `.txt` and `.md` files parsed into rich-text documents.
- [x] **Document File Attachments:** Dedicated drawer for attaching PDFs, images, DOCX, etc., with download and delete controls.
- [x] **Collaborative Sharing Model:** Owner, Editor, and Viewer permission levels with real-time UI state shifts.
- [x] **Dashboard Organization:** Live search filter + segmented tabs (*All*, *My Documents*, *Shared with Me*).
- [x] **Export Capabilities:** Export to Markdown (`.md`), HTML (`.html`), and Print to PDF.
- [x] **Persistence:** Local atomic file-backed JSON database surviving server restarts.
- [x] **Automated Tests:** 7 comprehensive unit & integration tests (`npm test`).
- [x] **Production Build:** Passes `npm run build` with zero errors.

### ⚠️ What is Intentionally Incomplete / Scoped Out:
- **Real-Time WebSockets Cursor Presence:** Real-time multi-cursor syncing (CRDT / Yjs) was deprioritized to guarantee rock-solid core document editing, file uploads, permissions, and persistence within the 4-6 hour constraint.
- **Full `.docx` binary round-trip editor:** We prioritized native Markdown and plaintext import because modern product and engineering teams live in Markdown. Attachments support `.docx` file storage and download.

---

## 🔮 What We Would Build Next (With Another 2-4 Hours)

1. **Yjs WebSocket Presence Integration:**
   - Connect `@tiptap/extension-collaboration` to a lightweight WebSocket server so multiple users see each other's live selections and cursor names in real time.
2. **Inline Comments & Suggestion Mode:**
   - Allow reviewers to highlight paragraphs and add discussion threads or propose tracked changes.
3. **Document Revision History:**
   - Add a historical snapshot drawer allowing users to browse prior auto-save checkpoints and restore past versions.
4. **Cloud Database Swapping:**
   - Abstract `src/lib/db.ts` behind an adapter interface to support PostgreSQL / Supabase via `DATABASE_URL` for serverless production clusters.
