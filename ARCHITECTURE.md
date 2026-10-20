# Architecture & Engineering Decisions Note

**Author:** Pranjal Singh  
**Project:** Ajaia Docs (Collaborative Document Platform)  
**Role:** Full Stack Product Engineer Assignment  

---

## 1. Executive Summary & Product Objective

The objective of this assignment is to ship a focused, high-fidelity collaborative document editor inspired by Google Docs within a strict 4-6 hour delivery timebox. Rather than attempting a shallow, buggy imitation of every Google Docs feature, our strategy prioritized **depth in core daily workflows**:
1. Seamless document drafting with intuitive rich-text formatting.
2. File ingestion and attachment management associated with documents.
3. A transparent multi-user sharing model with distinct Owner, Editor, and Viewer permission enforcement.
4. Resilient persistence ensuring zero state loss on refresh.
5. High engineering craft: automated test coverage, strict TypeScript contracts, and zero external infrastructure setup barriers for reviewers.

---

## 2. System Architecture & Data Flow

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

### Component Breakdown
- **Frontend Layer:** Next.js 16 Client Components utilizing React 19, TipTap (ProseMirror-based), and Lucide icons.
- **Styling Architecture:** Pure CSS variables and custom design tokens (`globals.css`) adhering to strict modern typography (`Inter`), Google Docs paper elevation, and micro-animations without external CSS framework bloat.
- **API & Business Logic Layer:** Next.js Route Handlers with request validation, role extraction, permission enforcement, and structured error responses.
- **Storage Layer:** High-performance file-backed JSON store with atomic file swapping (`fs.renameSync` via temporary files) to eliminate concurrency race conditions.

---

## 3. Key Prioritization Decisions & Tradeoffs

| Feature Area | Prioritized | Intentionally Deprioritized | Rationale |
| :--- | :--- | :--- | :--- |
| **Rich Text Editor** | TipTap / ProseMirror with Headings (H1-H3), Bold, Italic, Underline, Lists, Code, Highlight, Undo/Redo | Raw `contenteditable` or markdown-only editor | Raw `contenteditable` is notorious for cross-browser inconsistencies and DOM bugs. TipTap provides a battle-tested semantic document model with robust keyboard shortcuts and clean HTML serialization. |
| **User Authentication** | 1-click **User Switcher** with 3 seeded personas (Alice, Bob, Charlie) | Full OAuth / NextAuth / JWT login flow | In a take-home review context, auth signup flows introduce unnecessary friction for reviewers. A 1-click user switcher allows reviewers to verify multi-user permission shifts (Owner vs. Editor vs. Viewer) in seconds. |
| **Data Persistence** | Atomic file-backed persistence in `.data/db.json` | Cloud PostgreSQL / Supabase / Prisma SQLite | Cloud databases require environment variables, database provisioning, and network connectivity, which often fail on cold clone evaluation. Atomic local storage works out of the box with zero external dependencies while preserving all documents, attachments, and shares. |
| **File Handling** | Dual workflow: Direct file import (.md/.txt) into editable docs + Document file attachments (.pdf, images, docx) | Full Word (.docx) XML AST roundtrip converter | Ingesting Markdown and plaintext satisfies the product need to quickly turn meeting notes and READMEs into live editable docs, while attachments allow associated project assets to live alongside the doc. |
| **Collaboration Model** | Discrete permission roles (Owner, Editor, Viewer) with server-side API gatekeeping | Multi-cursor Operational Transformation (CRDT / Yjs over WebSockets) | Real-time multi-cursor syncing is complex and error-prone to complete robustly within 4-6 hours. Role-based sharing, auto-save status indicators, and permission guards deliver immediate, demonstrable product value. |

---

## 4. Permission & Access Control Matrix

The platform implements a server-enforced security matrix across all REST API handlers:

| Action | Owner | Editor | Viewer |
| :--- | :---: | :---: | :---: |
| **Read Document Content** | ✅ | ✅ | ✅ |
| **Edit Content & Inline Title** | ✅ | ✅ | ❌ (Blocked with 403) |
| **Invite Collaborators** | ✅ | ✅ | ❌ (Blocked with 403) |
| **Revoke Collaborators** | ✅ | ❌ | ❌ |
| **Upload Attachments** | ✅ | ✅ | ❌ |
| **Download Attachments** | ✅ | ✅ | ✅ |
| **Delete Document** | ✅ | ❌ | ❌ |

In the UI, Viewers receive an informative alert banner, the TipTap editor instance is initialized with `editable={false}`, and formatting controls are disabled.

---

## 5. Automated Testing Strategy

Rather than relying purely on manual verification, we built an automated test suite (`tests/db.test.ts`) executed via Node's native test runner (`npm test`):
- **User Initialization:** Validates that seed personas are correctly loaded into memory.
- **Role Annotation:** Verifies that documents returned to a given user are correctly tagged with their dynamic role (`owner`, `editor`, or `viewer`).
- **CRUD Operations:** Tests document creation, title renaming, and word count calculation.
- **Permission Enforcement:** Proves that an Editor can update document content, while a Viewer edit attempt is strictly rejected.
- **Access Revocation:** Proves that revoking a user's share removes their access immediately.
- **Attachment Lifecycle:** Tests file association, listing, and deletion.
- **Markdown Parsing:** Validates conversion of headings, lists, bold text, and code blocks into valid HTML.

---

## 6. What We Would Build Next (With Another 2-4 Hours)

1. **Yjs / WebSocket Real-time Cursors:** Connect TipTap's `@tiptap/extension-collaboration` to a lightweight WebSocket server to show real-time collaborator presence indicators and live cursor selections.
2. **Inline Comments & Suggestion Mode:** Allow users to highlight text and leave threaded comments or suggest text replacements without directly editing.
3. **Document Revision History:** Add a slider or timeline drawer allowing users to view timestamped snapshots and restore past versions.
4. **Cloud Database Adaptor:** Add an optional adapter pattern in `src/lib/db.ts` to swap the local file storage with Supabase / Neon PostgreSQL when `DATABASE_URL` is set in production.
