import fs from 'fs';
import path from 'path';
import { User, DocumentItem, DocumentShare, DocumentAttachment, AccessLevel, UserRole } from './types';
import { calculateTextStats } from './markdown-parser';

interface DatabaseSchema {
  users: User[];
  documents: DocumentItem[];
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', '.data')
  : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Seed Users for multi-user simulation
export const SEED_USERS: User[] = [
  {
    id: 'user_alice',
    name: 'Alice Walker',
    email: 'alice@ajaia.io',
    avatar: '👩‍💼',
    title: 'Product Lead',
    color: '#6366f1',
  },
  {
    id: 'user_bob',
    name: 'Bob Chen',
    email: 'bob@ajaia.io',
    avatar: '👨‍🎨',
    title: 'Design Lead',
    color: '#ec4899',
  },
  {
    id: 'user_charlie',
    name: 'Charlie Davis',
    email: 'charlie@ajaia.io',
    avatar: '👨‍💻',
    title: 'Engineering Lead',
    color: '#10b981',
  },
];

// Seed Documents
const SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc_1',
    title: '🚀 Ajaia Product Spec: AI-Assisted Document Platform',
    content: `
<h1>Ajaia Product Spec: AI-Assisted Document Platform</h1>
<p><strong>Status:</strong> In Review &nbsp;|&nbsp; <strong>Author:</strong> Alice Walker &nbsp;|&nbsp; <strong>Target Release:</strong> Q4 2026</p>
<hr />
<h2>1. Executive Summary</h2>
<p>Modern product teams lose dozens of hours every sprint bouncing between disconnected tools for drafting specs, design reviews, and engineering RFCs. <em>Ajaia Docs</em> unifies rich collaborative drafting, structured file attachments, and instant teammate sharing into a single, cohesive canvas.</p>
<blockquote>
  <p>"Our goal is to make document creation as fast as thinking, with zero friction in teammate handoffs."</p>
</blockquote>
<h2>2. Core Functional Requirements</h2>
<ul>
  <li><strong>Rich Formatting Engine:</strong> Headings, clean typography, bold/italic accents, formatted lists, and code blocks.</li>
  <li><strong>Native File Imports:</strong> Direct ingestion of Markdown and plaintext files straight into editable live docs.</li>
  <li><strong>Lightweight Access Control:</strong> Distinct Owner, Editor, and Viewer permissions with real-time UI state reflect.</li>
  <li><strong>Resilient Local Persistence:</strong> Automated debounced saving ensuring zero state loss across reloads.</li>
</ul>
<h2>3. Key Success Metrics</h2>
<ol>
  <li>Document creation time decreased by <strong>45%</strong>.</li>
  <li>Cross-functional review turnaround within <strong>24 hours</strong>.</li>
  <li>Zero accidental document overwrite incidents via explicit access roles.</li>
</ol>
<pre><code>// Example Share Payload Contract
POST /api/documents/doc_1/share
{
  "targetEmail": "bob@ajaia.io",
  "accessLevel": "editor"
}</code></pre>
<p>Please review and leave feedback or suggest edits directly!</p>
`.trim(),
    ownerId: 'user_alice',
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-20T08:30:00.000Z',
    wordCount: 195,
    characterCount: 1420,
    shares: [
      {
        id: 'share_1',
        documentId: 'doc_1',
        userId: 'user_bob',
        accessLevel: 'editor',
        sharedAt: '2026-10-18T11:00:00.000Z',
        sharedBy: 'user_alice',
      },
      {
        id: 'share_2',
        documentId: 'doc_1',
        userId: 'user_charlie',
        accessLevel: 'viewer',
        sharedAt: '2026-10-18T11:05:00.000Z',
        sharedBy: 'user_alice',
      },
    ],
    attachments: [
      {
        id: 'att_1',
        documentId: 'doc_1',
        filename: 'ajaia_roadmap_q4.pdf',
        originalName: 'ajaia_roadmap_q4.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 245760,
        uploadedAt: '2026-10-18T12:00:00.000Z',
        uploadedBy: 'user_alice',
      },
    ],
  },
  {
    id: 'doc_2',
    title: '🎨 Design System & Component Library RFC',
    content: `
<h1>Design System & Component Library RFC</h1>
<p><strong>Lead:</strong> Bob Chen &nbsp;|&nbsp; <strong>Collaborators:</strong> Alice Walker, Charlie Davis</p>
<hr />
<h2>Overview</h2>
<p>We are standardizing our typography scale, elevation styles, and interactive states to deliver a top-tier desktop web experience inspired by Google Docs and modern productivity suites.</p>
<h2>Design Tokens</h2>
<ul>
  <li><strong>Background Canvas:</strong> Warm neutral paper background with subtle drop-shadows.</li>
  <li><strong>Brand Accents:</strong> Indigo (#6366f1) and Violet tones for focus rings and active states.</li>
  <li><strong>Typography:</strong> Crisp Inter font with balanced line heights for long-form readability.</li>
</ul>
<blockquote>
  <p>Every interactive element should respond with smooth micro-animations (&lt;150ms transitions).</p>
</blockquote>
    `.trim(),
    ownerId: 'user_bob',
    createdAt: '2026-10-19T09:15:00.000Z',
    updatedAt: '2026-10-19T14:20:00.000Z',
    wordCount: 85,
    characterCount: 680,
    shares: [
      {
        id: 'share_3',
        documentId: 'doc_2',
        userId: 'user_alice',
        accessLevel: 'editor',
        sharedAt: '2026-10-19T10:00:00.000Z',
        sharedBy: 'user_bob',
      },
    ],
    attachments: [],
  },
  {
    id: 'doc_3',
    title: '⚡ System Architecture & API Contracts',
    content: `
<h1>System Architecture & API Contracts</h1>
<p><strong>Owner:</strong> Charlie Davis &nbsp;|&nbsp; <strong>Confidentiality:</strong> Internal</p>
<hr />
<h2>1. Architectural Goals</h2>
<p>Ensure reliable persistence, sub-millisecond route responses, and predictable role-based permission verification across all API endpoints.</p>
<h2>2. Security & Role Matrix</h2>
<ul>
  <li><strong>Owner:</strong> Full read, write, rename, share management, and document deletion.</li>
  <li><strong>Editor:</strong> Full read and write content updates. Cannot delete the document.</li>
  <li><strong>Viewer:</strong> Strictly read-only access. Editor input controls are disabled.</li>
</ul>
    `.trim(),
    ownerId: 'user_charlie',
    createdAt: '2026-10-19T16:00:00.000Z',
    updatedAt: '2026-10-20T06:45:00.000Z',
    wordCount: 72,
    characterCount: 540,
    shares: [
      {
        id: 'share_4',
        documentId: 'doc_3',
        userId: 'user_alice',
        accessLevel: 'viewer',
        sharedAt: '2026-10-19T16:30:00.000Z',
        sharedBy: 'user_charlie',
      },
    ],
    attachments: [],
  },
];

class DatabaseService {
  private inMemoryDb: DatabaseSchema | null = null;

  constructor() {
    this.ensureStorage();
  }

  private ensureStorage(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        // If repo seed exists, copy it, else initialize
        const repoSeed = path.join(process.cwd(), '.data', 'db.json');
        if (fs.existsSync(repoSeed)) {
          const content = fs.readFileSync(repoSeed, 'utf8');
          fs.writeFileSync(DB_FILE, content, 'utf8');
          this.inMemoryDb = JSON.parse(content);
          return;
        }

        const initial: DatabaseSchema = {
          users: SEED_USERS,
          documents: SEED_DOCUMENTS,
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
        this.inMemoryDb = initial;
      }
    } catch {
      // In-memory fallback if disk is not writable
      if (!this.inMemoryDb) {
        this.inMemoryDb = {
          users: SEED_USERS,
          documents: SEED_DOCUMENTS,
        };
      }
    }
  }

  private load(): DatabaseSchema {
    if (this.inMemoryDb) {
      return this.inMemoryDb;
    }
    this.ensureStorage();
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(content) as DatabaseSchema;
      this.inMemoryDb = data;
      return data;
    } catch {
      const initial: DatabaseSchema = {
        users: SEED_USERS,
        documents: SEED_DOCUMENTS,
      };
      this.inMemoryDb = initial;
      return initial;
    }
  }

  private save(data: DatabaseSchema): void {
    this.inMemoryDb = data;
    try {
      this.ensureStorage();
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.warn('Storage write fallback to in-memory cache:', err);
    }
  }

  public getUsers(): User[] {
    const db = this.load();
    return db.users;
  }

  public getUserById(id: string): User | undefined {
    const db = this.load();
    return db.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    const db = this.load();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getDocuments(forUserId: string): DocumentItem[] {
    const db = this.load();
    const result: DocumentItem[] = [];

    for (const doc of db.documents) {
      const isOwner = doc.ownerId === forUserId;
      const share = doc.shares.find((s) => s.userId === forUserId);

      if (isOwner || share) {
        const userRole: UserRole = isOwner ? 'owner' : (share?.accessLevel || 'viewer');
        const owner = db.users.find((u) => u.id === doc.ownerId);

        // Populate user details for shares
        const populatedShares = doc.shares.map((s) => ({
          ...s,
          user: db.users.find((u) => u.id === s.userId),
        }));

        result.push({
          ...doc,
          owner,
          shares: populatedShares,
          currentUserRole: userRole,
        });
      }
    }

    // Sort by updated at descending
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getDocumentById(id: string, forUserId: string): DocumentItem | null {
    const db = this.load();
    const doc = db.documents.find((d) => d.id === id);
    if (!doc) return null;

    const isOwner = doc.ownerId === forUserId;
    const share = doc.shares.find((s) => s.userId === forUserId);

    if (!isOwner && !share) {
      return null; // Forbidden / Not Found
    }

    const userRole: UserRole = isOwner ? 'owner' : (share?.accessLevel || 'viewer');
    const owner = db.users.find((u) => u.id === doc.ownerId);
    const populatedShares = doc.shares.map((s) => ({
      ...s,
      user: db.users.find((u) => u.id === s.userId),
    }));

    return {
      ...doc,
      owner,
      shares: populatedShares,
      currentUserRole: userRole,
    };
  }

  public createDocument(params: {
    title: string;
    content?: string;
    ownerId: string;
  }): DocumentItem {
    const db = this.load();
    const now = new Date().toISOString();
    const content = params.content || '<p>Start typing your thoughts here...</p>';
    const stats = calculateTextStats(content);

    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: params.title.trim() || 'Untitled Document',
      content,
      ownerId: params.ownerId,
      createdAt: now,
      updatedAt: now,
      wordCount: stats.wordCount,
      characterCount: stats.characterCount,
      shares: [],
      attachments: [],
      currentUserRole: 'owner',
    };

    db.documents.unshift(newDoc);
    this.save(db);

    const owner = db.users.find((u) => u.id === newDoc.ownerId);
    return { ...newDoc, owner };
  }

  public updateDocument(
    id: string,
    updates: { title?: string; content?: string },
    forUserId: string
  ): { success: boolean; document?: DocumentItem; error?: string } {
    const db = this.load();
    const docIndex = db.documents.findIndex((d) => d.id === id);
    if (docIndex === -1) {
      return { success: false, error: 'Document not found' };
    }

    const doc = db.documents[docIndex];
    const isOwner = doc.ownerId === forUserId;
    const share = doc.shares.find((s) => s.userId === forUserId);

    if (!isOwner && (!share || share.accessLevel !== 'editor')) {
      return { success: false, error: 'Unauthorized: Viewer cannot edit document' };
    }

    const now = new Date().toISOString();
    if (updates.title !== undefined) {
      doc.title = updates.title.trim() || 'Untitled Document';
    }
    if (updates.content !== undefined) {
      doc.content = updates.content;
      const stats = calculateTextStats(updates.content);
      doc.wordCount = stats.wordCount;
      doc.characterCount = stats.characterCount;
    }

    doc.updatedAt = now;
    db.documents[docIndex] = doc;
    this.save(db);

    const owner = db.users.find((u) => u.id === doc.ownerId);
    const userRole: UserRole = isOwner ? 'owner' : 'editor';

    return {
      success: true,
      document: {
        ...doc,
        owner,
        currentUserRole: userRole,
      },
    };
  }

  public deleteDocument(id: string, forUserId: string): { success: boolean; error?: string } {
    const db = this.load();
    const docIndex = db.documents.findIndex((d) => d.id === id);
    if (docIndex === -1) {
      return { success: false, error: 'Document not found' };
    }

    const doc = db.documents[docIndex];
    if (doc.ownerId !== forUserId) {
      return { success: false, error: 'Only the document owner can delete this document' };
    }

    db.documents.splice(docIndex, 1);
    this.save(db);
    return { success: true };
  }

  public shareDocument(
    documentId: string,
    targetEmailOrId: string,
    accessLevel: AccessLevel,
    currentUserId: string
  ): { success: boolean; share?: DocumentShare; error?: string } {
    const db = this.load();
    const doc = db.documents.find((d) => d.id === documentId);
    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    // Must be owner or editor to share
    const isOwner = doc.ownerId === currentUserId;
    const isEditor = doc.shares.some((s) => s.userId === currentUserId && s.accessLevel === 'editor');
    if (!isOwner && !isEditor) {
      return { success: false, error: 'Unauthorized: Only owners or editors can share documents' };
    }

    // Find target user
    const targetUser =
      db.users.find((u) => u.id === targetEmailOrId) ||
      db.users.find((u) => u.email.toLowerCase() === targetEmailOrId.toLowerCase());

    if (!targetUser) {
      return { success: false, error: `User "${targetEmailOrId}" not found. Try alice@ajaia.io, bob@ajaia.io, or charlie@ajaia.io` };
    }

    if (targetUser.id === doc.ownerId) {
      return { success: false, error: 'User is already the owner of this document' };
    }

    const existingShareIndex = doc.shares.findIndex((s) => s.userId === targetUser.id);
    const now = new Date().toISOString();

    if (existingShareIndex >= 0) {
      // Update existing share access level
      doc.shares[existingShareIndex].accessLevel = accessLevel;
      doc.shares[existingShareIndex].sharedAt = now;
      this.save(db);
      return {
        success: true,
        share: { ...doc.shares[existingShareIndex], user: targetUser },
      };
    } else {
      // Create new share
      const newShare: DocumentShare = {
        id: `share_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        documentId,
        userId: targetUser.id,
        accessLevel,
        sharedAt: now,
        sharedBy: currentUserId,
      };
      doc.shares.push(newShare);
      this.save(db);
      return {
        success: true,
        share: { ...newShare, user: targetUser },
      };
    }
  }

  public removeShare(
    documentId: string,
    targetUserId: string,
    currentUserId: string
  ): { success: boolean; error?: string } {
    const db = this.load();
    const doc = db.documents.find((d) => d.id === documentId);
    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    const isOwner = doc.ownerId === currentUserId;
    if (!isOwner && currentUserId !== targetUserId) {
      return { success: false, error: 'Only document owners can revoke teammate access' };
    }

    const initialLen = doc.shares.length;
    doc.shares = doc.shares.filter((s) => s.userId !== targetUserId);

    if (doc.shares.length === initialLen) {
      return { success: false, error: 'Share record not found' };
    }

    this.save(db);
    return { success: true };
  }

  public addAttachment(
    documentId: string,
    attachment: {
      originalName: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      uploadedBy: string;
    }
  ): { success: boolean; attachment?: DocumentAttachment; error?: string } {
    const db = this.load();
    const doc = db.documents.find((d) => d.id === documentId);
    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    const newAttachment: DocumentAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      documentId,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      uploadedAt: new Date().toISOString(),
      uploadedBy: attachment.uploadedBy,
    };

    if (!doc.attachments) {
      doc.attachments = [];
    }
    doc.attachments.push(newAttachment);
    this.save(db);

    return { success: true, attachment: newAttachment };
  }

  public deleteAttachment(
    documentId: string,
    attachmentId: string,
    forUserId: string
  ): { success: boolean; error?: string } {
    const db = this.load();
    const doc = db.documents.find((d) => d.id === documentId);
    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    const isOwner = doc.ownerId === forUserId;
    const isEditor = doc.shares.some((s) => s.userId === forUserId && s.accessLevel === 'editor');
    if (!isOwner && !isEditor) {
      return { success: false, error: 'Unauthorized to delete attachments' };
    }

    const attIndex = doc.attachments.findIndex((a) => a.id === attachmentId);
    if (attIndex === -1) {
      return { success: false, error: 'Attachment not found' };
    }

    const [deleted] = doc.attachments.splice(attIndex, 1);
    this.save(db);

    // Clean up file from disk if present
    const filePath = path.join(UPLOADS_DIR, deleted.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }

    return { success: true };
  }
}

export const dbService = new DatabaseService();
