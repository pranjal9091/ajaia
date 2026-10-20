# 3-5 Minute Video Walkthrough Script

Use this structured script to record your 3-5 minute video walkthrough on Loom, YouTube, or Google Drive.

---

## ⏱️ Video Outline & Timing (Total: ~3.5 - 4.5 Minutes)

| Segment | Timing | Key Talking Points |
| :--- | :--- | :--- |
| **1. Intro & Objective** | 0:00 - 0:30 | Introduce yourself, role, and the objective: A lightweight collaborative document platform inspired by Google Docs for Ajaia. |
| **2. Core Product Flow Demo** | 0:30 - 1:45 | Dashboard, Template picker, Document creation, TipTap rich text formatting, auto-saving indicator, and title rename. |
| **3. File Uploads & Imports** | 1:45 - 2:30 | Import `.md` / `.txt` file into an editable document, plus document attachments drawer with PDF download. |
| **4. Sharing & Permission Model** | 2:30 - 3:15 | Share modal, Owner vs. Editor vs. Viewer permissions. Demonstrate 1-click user switcher from Alice (Owner) to Charlie (Viewer) showing read-only lockdown. |
| **5. Architecture & AI Workflow** | 3:15 - 4:00 | Why atomic persistence and TipTap were chosen; where AI sped up scaffolding vs. where human judgment rejected overengineering (like complex OAuth). |
| **6. Wrap Up & Next Steps** | 4:00 - 4:30 | What we'd build with another 2-4 hours (Yjs real-time cursors, inline comments). |

---

## 🎬 Word-For-Word Walkthrough Script

### 0:00 - 0:30 | Introduction
> *"Hi everyone, my name is Pranjal Singh, and this is my walkthrough submission for the Full Stack Product Engineer role at Ajaia.*  
> *The objective of this challenge was to build a lightweight, collaborative document editor inspired by Google Docs, demonstrating sound product prioritization, full-stack capability, and pragmatic AI-assisted development under tight delivery constraints.*  
> *Let's jump straight into the application."*

### 0:30 - 1:45 | Core Editing & Auto-Save
> *"Here on the home dashboard at `localhost:3000`, we have our document hub with quick templates, active search, and document tabs.*  
> *Let's open our seeded document: **'🚀 Ajaia Product Spec'**.*  
> *As you can see, the editor provides a clean, Google Docs inspired paper canvas. It is powered by TipTap and ProseMirror, giving us reliable semantic rich text formatting:*  
> *- Headings (H1, H2, H3)*  
> *- Bold, italic, underline, strikethrough, and highlighting*  
> *- Formatted lists, blockquotes, and code blocks.*  
> *Notice at the top, we have an inline editable title and a live cloud save indicator. When I make an edit or type new thoughts, the status immediately switches to **'Saving to cloud...'** and debounces before confirming **'All changes saved to cloud'**.*  
> *We also support keyboard shortcuts like `⌘B`, `⌘I`, and `⌘S` for instant saving."*

### 1:45 - 2:30 | File Ingestion & Attachments
> *"Next, let's look at file handling. We implemented two distinct, high-impact file workflows:*  
> *First, in the top toolbar, you'll see **'Files (1)'**. Clicking this opens our slide-over attachment drawer. Here, teams can attach supporting artifacts like PDFs, images, specifications, or spreadsheets to any document. Reviewers can preview file sizes, timestamps, and download them with one click.*  
> *Second, if we go back to the dashboard, we have **'Import from File'**. This allows users to drag and drop existing `.md` or `.txt` files — like READMEs or meeting transcripts — and our backend parser automatically parses the markdown syntax into a live, rich-text editable document in seconds."*

### 2:30 - 3:15 | Collaborative Sharing & Role Enforcement
> *"Now let's examine the sharing and permissions model.*  
> *Clicking the **'Share'** button opens our Google Docs style collaboration modal. Here, you see Alice Walker is the Owner, Bob Chen is an Editor, and Charlie Davis is a Viewer.*  
> *We can invite teammates by email, adjust their roles between Editor and Viewer, revoke access, or copy a direct shareable link.*  
> *To make testing this effortless for reviewers without auth friction, we built a 1-click **User Switcher** in the top navigation.*  
> *Right now, we are viewing as Alice (the Owner). Let's switch to **Charlie Davis**.*  
> *Notice immediately: Charlie's badge updates to **'Viewer'**, an alert banner notifies him that he is in read-only mode, the TipTap editor is locked, and all formatting controls are disabled. Any direct API PATCH request from a viewer is rejected server-side with HTTP 403 Forbidden.*  
> *If we go back to the dashboard as Charlie, notice our tabs: **'My Documents'** shows Charlie's own architectural spec, while **'Shared with Me'** clearly segments documents shared by Alice and Bob."*

### 3:15 - 4:00 | Architecture & AI-Native Workflow
> *"From an engineering perspective, this is built on **Next.js 16 with React 19 and TypeScript**. For storage, we prioritized reliable local atomic file persistence with zero external configuration barriers, ensuring all documents, shares, and files survive refreshes and server restarts.*  
> *We also have a full automated test suite running with `npm test`, covering permissions, CRUD, file parsing, and attachment lifecycles in under 100 milliseconds.*  
> *In terms of AI-native workflow, I used DeepMind's Gemini 3.8 Flash in Google Antigravity. AI materially sped up boilerplate generation, TipTap extension setup, and seed data creation. However, I applied strong human judgment: I explicitly rejected overengineered OAuth signup flows that would frustrate reviewers, resolved Next.js 16 partial prerendering Suspense boundaries, and chose atomic storage over fragile cloud databases."*

### 4:00 - 4:30 | Conclusion & Future Roadmap
> *"With another 2-4 hours, the next logical steps would be integrating Yjs WebSockets for real-time multiplayer cursor indicators, inline comment threads, and a document revision history drawer.*  
> *Thank you very much for your time and review! All code, architecture notes, and run instructions are detailed in the repository."*
