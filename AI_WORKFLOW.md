# AI-Native Workflow Note

**Author:** Pranjal Singh  
**Project:** Ajaia Docs  
**Role:** Full Stack Product Engineer Assignment  

---

## 1. AI Tools Utilized

- **Primary AI Assistant:** Google Antigravity Agent powered by DeepMind's Gemini 3.8 Flash reasoning model.
- **Execution Environment:** Agentic terminal orchestration, file manipulation tools, and live system diagnostics.
- **Verification Tooling:** Node.js native test runner, TypeScript compiler (`tsc`), and Next.js 16 Turbopack build engine.

---

## 2. Where AI Materially Sped Up the Work

1. **Boilerplate Elimination & Project Scaffolding:**
   - Scaffolding the Next.js 16 full-stack structure with TypeScript, App Router API route handlers, and type definitions took less than 2 minutes.
   - Bootstrapping TipTap with ProseMirror extensions (`StarterKit`, `Underline`, `Highlight`, `Placeholder`) without manual trial-and-error.

2. **Realistic Seed Data Generation:**
   - Instead of generic `"Lorem ipsum"` filler text, the assistant generated realistic, product-relevant documents (*Ajaia Product Spec*, *Design Tokens RFC*, *System Architecture & API Contracts*) with complete headings, blockquotes, code blocks, and sharing metadata.
   - This makes the application immediately feel like a real product on first launch.

3. **High-Coverage Test Suite Generation:**
   - The AI generated comprehensive integration test cases in `tests/db.test.ts` covering CRUD operations, permission boundaries, and attachment lifecycles in seconds, executing in sub-10 milliseconds.

4. **Markdown-to-HTML Parser Synthesis:**
   - The AI generated a clean, standalone parser for `#`, `##`, `###`, `**bold**`, `*italic*`, lists, blockquotes, and code blocks, enabling users to import `.md` and `.txt` files directly into editable documents without heavy external parser dependencies.

---

## 3. What AI-Generated Output Was Changed or Rejected

True product engineering requires applying critical human judgment to filter and refine AI suggestions:

### 1. Rejected Overcomplicated Authentication
- **Initial AI Tendency:** AI coding assistants often jump to generating full NextAuth, Supabase Auth, or JWT token flows with login screens, signup forms, and cookie validation.
- **Engineering Judgment:** In a take-home assessment, requiring reviewers to register accounts or configure third-party OAuth apps creates immediate evaluation friction.
- **Decision:** I rejected full auth and instead directed the implementation of a 1-click **User Switcher** in the top navigation featuring 3 seeded personas (Alice Walker as Product Lead, Bob Chen as Design Lead, Charlie Davis as Engineering Lead). This allows reviewers to toggle perspectives and verify access permissions in 5 seconds.

### 2. Fixed Next.js 16 Prerendering Suspense Boundary
- **Issue:** During production build (`npm run build`), Next.js 16 threw a prerender error on dynamic client route `/document/[id]`:
  `Error: Next.js encountered URL data useParams() in a Client Component outside of <Suspense>.`
- **Resolution:** Wrapped `<DocumentPageContent />` in `<React.Suspense fallback={<Loader2 />}>` to ensure full compliance with Next.js 16 partial prerendering and streaming hydration.

### 3. Detected & Resolved Variable Shadowing in `ExportMenu.tsx`
- **Issue:** The AI generated `document.addEventListener('mousedown', ...)` inside a component receiving a prop named `document: DocumentItem`. TypeScript caught `Property 'addEventListener' does not exist on type 'DocumentItem'`.
- **Resolution:** Disambiguated the browser DOM API to `window.document.addEventListener`, preventing runtime crashes when closing dropdown menus.

### 4. Rejected Fragile External Database Setup
- **Initial AI Tendency:** Suggesting PostgreSQL via Docker or external hosted cloud instances.
- **Engineering Judgment:** External database setups often fail during reviewer evaluation due to port conflicts, missing credentials, or cold start latency.
- **Decision:** Implemented an atomic, file-backed local storage engine in `src/lib/db.ts` utilizing `fs.renameSync` via temporary files. This guarantees 100% portability, zero external configuration, and atomic write safety.

---

## 4. Verification of Correctness, UX Quality, and Reliability

1. **Automated Unit & Integration Testing:**
   - Ran `npm test` through Node's test runner (`tsx --test tests/db.test.ts`).
   - Verified that 7 out of 7 test cases passed cleanly, including unauthorized viewer editing prevention (403), share revocation, and markdown parsing.

2. **TypeScript & Production Build Validation:**
   - Executed `npm run build` to confirm zero lint errors, zero type errors, and full static/dynamic route optimization across all 8 endpoints.

3. **Runtime HTTP & API Validation:**
   - Verified HTTP 200 OK responses, JSON serialization, and dynamic route rendering via `curl` across `/`, `/api/users`, `/api/documents`, and `/document/doc_1`.

4. **UX & Visual Polish:**
   - Designed Google Docs inspired layout with paper canvas elevation, sticky formatting toolbar, debounced auto-saving status pill (`All changes saved to cloud`), and clear viewer alert banners.
