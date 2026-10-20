export type AccessLevel = 'editor' | 'viewer';
export type UserRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  color: string;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  userId: string;
  user?: User;
  accessLevel: AccessLevel;
  sharedAt: string;
  sharedBy: string;
}

export interface DocumentAttachment {
  id: string;
  documentId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  title: string;
  content: string;
  savedAt: string;
  savedBy: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string; // HTML content
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  characterCount: number;
  shares: DocumentShare[];
  attachments: DocumentAttachment[];
  revisions?: DocumentRevision[];
  currentUserRole?: UserRole;
}
