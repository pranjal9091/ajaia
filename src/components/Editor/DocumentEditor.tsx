'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { DocumentItem } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { EditorToolbar } from './EditorToolbar';
import { ShareModal } from '../ShareModal';
import { AttachmentPanel } from '../AttachmentPanel';
import { ExportMenu } from '../ExportMenu';
import { UserSwitcher } from '../UserSwitcher';
import {
  ArrowLeft,
  Cloud,
  CloudCheck,
  Loader2,
  Users,
  Paperclip,
  Eye,
  FileEdit,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface DocumentEditorProps {
  initialDocument: DocumentItem;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialDocument }) => {
  const { currentUser } = useUser();
  const [doc, setDoc] = useState<DocumentItem>(initialDocument);
  const [title, setTitle] = useState(initialDocument.title);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAttachmentPanelOpen, setIsAttachmentPanelOpen] = useState(false);
  const [stats, setStats] = useState({
    wordCount: initialDocument.wordCount || 0,
    characterCount: initialDocument.characterCount || 0,
  });

  const isViewer = doc.currentUserRole === 'viewer';
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Re-fetch document whenever active user changes
  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/documents/${initialDocument.id}?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.document) {
          setDoc(data.document);
          setTitle(data.document.title);
        }
      })
      .catch((err) => console.error('Failed to sync document user view:', err));
  }, [currentUser, initialDocument.id]);

  const performSave = useCallback(
    async (newTitle?: string, newContent?: string) => {
      if (isViewer) return;

      setSaveStatus('saving');
      try {
        const payload: { title?: string; content?: string; userId?: string } = {
          userId: currentUser?.id,
        };
        if (newTitle !== undefined) payload.title = newTitle;
        if (newContent !== undefined) payload.content = newContent;

        const res = await fetch(`/api/documents/${doc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success && data.document) {
          setDoc((prev) => ({
            ...prev,
            ...data.document,
            currentUserRole: prev.currentUserRole,
          }));
          setSaveStatus('saved');
        } else {
          setSaveStatus('unsaved');
          console.error('Save failed:', data.error);
        }
      } catch (err) {
        setSaveStatus('unsaved');
        console.error('Network error saving document:', err);
      }
    },
    [doc.id, currentUser?.id, isViewer]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight,
      Placeholder.configure({
        placeholder: isViewer
          ? 'This document is read-only...'
          : 'Type your document here, or use markdown shortcuts like # Heading...',
      }),
    ],
    content: initialDocument.content,
    editable: !isViewer,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (isViewer) return;

      const html = ed.getHTML();
      const text = ed.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setStats({ wordCount: words, characterCount: text.length });

      setSaveStatus('unsaved');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        performSave(undefined, html);
      }, 700);
    },
  });

  // Update editor editable state when role changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isViewer);
    }
  }, [editor, isViewer]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    if (isViewer) return;
    setTitle(newTitle);
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      performSave(newTitle, undefined);
    }, 700);
  };

  // Manual save keyboard shortcut (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!isViewer && editor) {
          performSave(title, editor.getHTML());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, title, isViewer, performSave]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* Google Docs Style Header Bar */}
      <header
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 400,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left: Back Link & Document Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              transition: 'background var(--transition-fast)',
            }}
            title="Back to Documents"
          >
            <ArrowLeft size={20} />
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={isViewer}
                placeholder="Untitled Document"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 6px',
                  backgroundColor: 'transparent',
                  width: '100%',
                  maxWidth: '500px',
                  cursor: isViewer ? 'default' : 'text',
                }}
                onFocus={(e) => {
                  if (!isViewer) e.target.style.borderColor = 'var(--primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'transparent';
                }}
              />

              {/* Role Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor:
                    doc.currentUserRole === 'owner'
                      ? 'var(--primary-subtle)'
                      : doc.currentUserRole === 'editor'
                      ? 'var(--success-subtle)'
                      : 'var(--warning-subtle)',
                  color:
                    doc.currentUserRole === 'owner'
                      ? 'var(--primary-text)'
                      : doc.currentUserRole === 'editor'
                      ? 'var(--success-text)'
                      : 'var(--warning-text)',
                }}
              >
                {doc.currentUserRole === 'viewer' ? <Eye size={12} /> : <FileEdit size={12} />}
                <span>{doc.currentUserRole}</span>
              </span>
            </div>

            {/* Cloud Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '6px' }}>
              {isViewer ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning-text)' }}>
                  <Eye size={13} />
                  <span>Read-only view</span>
                </span>
              ) : saveStatus === 'saving' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving to cloud...</span>
                </span>
              ) : saveStatus === 'unsaved' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
                  <Cloud size={13} />
                  <span>Unsaved changes (Ctrl+S to save)</span>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                  <CloudCheck size={13} />
                  <span>All changes saved to cloud</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & User Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Attachments Button */}
          <button
            onClick={() => setIsAttachmentPanelOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-main)',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            title="View and upload document attachments"
          >
            <Paperclip size={15} />
            <span>Files ({doc.attachments?.length || 0})</span>
          </button>

          {/* Export Menu */}
          <ExportMenu document={doc} />

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
          >
            <Users size={15} />
            <span>Share</span>
            {doc.shares && doc.shares.length > 0 && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                }}
              >
                {doc.shares.length}
              </span>
            )}
          </button>

          {/* User Switcher */}
          <UserSwitcher />
        </div>
      </header>

      {/* Viewer Mode Banner */}
      {isViewer && (
        <div
          className="no-print"
          style={{
            backgroundColor: 'var(--warning-subtle)',
            borderBottom: '1px solid #fef3c7',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--warning-text)',
          }}
        >
          <ShieldAlert size={16} />
          <span>
            <strong>Viewer Mode:</strong> You can view, read, and export this document. Only Owner and Editors can edit content.
          </span>
        </div>
      )}

      {/* Main Canvas Area */}
      <main style={{ flex: 1, padding: '24px 20px 60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '850px' }}>
          {/* Formatting Toolbar */}
          <div className="no-print">
            <EditorToolbar editor={editor} disabled={isViewer} />
          </div>

          {/* Paper Canvas */}
          <div
            className="document-paper animate-fade-in"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-canvas)',
              border: '1px solid var(--border-subtle)',
              padding: '48px 56px',
              minHeight: '800px',
              position: 'relative',
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Bottom Bar: Stats */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 6px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            <div>
              <span>Owner: <strong>{doc.owner?.name || 'You'}</strong> ({doc.owner?.email})</span>
              <span style={{ margin: '0 8px' }}>&bull;</span>
              <span>Last updated: {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>{stats.wordCount} words</span>
              <span>&bull;</span>
              <span>{stats.characterCount} characters</span>
              <span>&bull;</span>
              <span>{Math.max(1, Math.ceil(stats.wordCount / 200))} min read</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <ShareModal
        document={doc}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onDocumentUpdated={(updated) => setDoc(updated)}
      />

      <AttachmentPanel
        document={doc}
        isOpen={isAttachmentPanelOpen}
        onClose={() => setIsAttachmentPanelOpen(false)}
        onDocumentUpdated={(updated) => setDoc(updated)}
      />
    </div>
  );
};
