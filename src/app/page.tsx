'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocumentItem } from '@/lib/types';
import { UserProvider, useUser } from '@/context/UserContext';
import { UserSwitcher } from '@/components/UserSwitcher';
import { ShareModal } from '@/components/ShareModal';
import {
  FileText,
  Plus,
  UploadCloud,
  Search,
  Users,
  Eye,
  FileEdit,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  FileCode,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank Document',
    subtitle: 'Start with a fresh, empty canvas',
    icon: <Plus size={22} color="var(--primary)" />,
    content: '<p></p>',
  },
  {
    id: 'meeting',
    title: 'Weekly Team Sync',
    subtitle: 'Agenda, discussion topics & action items',
    icon: <Calendar size={22} color="#0284c7" />,
    content: `
<h1>Weekly Team Sync</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()} &nbsp;|&nbsp; <strong>Attendees:</strong> Engineering &amp; Product</p>
<hr />
<h2>1. Agenda &amp; Updates</h2>
<ul>
  <li>Ship collaborative document platform v1 milestone.</li>
  <li>Review UX feedback on share access models.</li>
  <li>Sprint planning and backlog prioritization.</li>
</ul>
<h2>2. Open Discussion &amp; Decisions</h2>
<blockquote>
  <p>Decision: Standardize permissions into Owner, Editor, and Viewer tiers for maximum clarity.</p>
</blockquote>
<h2>3. Action Items</h2>
<ol>
  <li>Finalize automated test coverage and documentation.</li>
  <li>Verify file upload streaming endpoints.</li>
  <li>Record 3-minute product walkthrough.</li>
</ol>
    `.trim(),
  },
  {
    id: 'spec',
    title: 'Product Requirement Doc (PRD)',
    subtitle: 'Problem statement, specs & metrics',
    icon: <Sparkles size={22} color="#9333ea" />,
    content: `
<h1>PRD: Next-Generation Collaborative Editor</h1>
<p><strong>Author:</strong> Product Team &nbsp;|&nbsp; <strong>Target Quarter:</strong> Q4</p>
<hr />
<h2>1. Problem Statement</h2>
<p>Distributed product teams struggle with document fragmentation and complex permission management across multiple tools.</p>
<h2>2. User Stories</h2>
<ul>
  <li><strong>As a writer</strong>, I want rich text formatting with zero lag so I can capture ideas effortlessly.</li>
  <li><strong>As an owner</strong>, I want to control who can edit versus view my sensitive documents.</li>
  <li><strong>As a reviewer</strong>, I want to upload reference attachments directly alongside the doc.</li>
</ul>
<h2>3. Technical Architecture</h2>
<pre><code>// Client <-> Server Data Flow
UI (TipTap) -> Debounced Auto-Save -> REST API -> Atomic JSON/SQLite Persistence</code></pre>
    `.trim(),
  },
  {
    id: 'retro',
    title: 'Sprint Retrospective',
    subtitle: 'What went well & action items',
    icon: <Layers size={22} color="#16a34a" />,
    content: `
<h1>Sprint Retrospective</h1>
<p><strong>Sprint:</strong> 24 &nbsp;|&nbsp; <strong>Facilitator:</strong> Team Lead</p>
<hr />
<h2>🟢 What Went Well</h2>
<ul>
  <li>Fast delivery speed using modern full-stack patterns.</li>
  <li>Clean separation of UI, API handlers, and data persistence.</li>
</ul>
<h2>🟡 What Could Be Improved</h2>
<ul>
  <li>Add real-time websocket presence cursors in the next iteration.</li>
</ul>
<h2>🎯 Action Items</h2>
<ol>
  <li>Polish README and deployment steps.</li>
</ol>
    `.trim(),
  },
];

function DashboardContent() {
  const router = useRouter();
  const { currentUser, isLoading: isUserLoading } = useUser();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'shared'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareTargetDoc, setShareTargetDoc] = useState<DocumentItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading && currentUser) {
      fetchDocuments();
    }
  }, [currentUser, isUserLoading]);

  // Create new document from template or blank
  const handleCreateDocument = async (title: string, content?: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          ownerId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.document) {
        router.push(`/document/${data.document.id}`);
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  // Upload file import (.txt or .md)
  const handleFileImport = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentUser) return;
    const file = files[0];

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('ownerId', currentUser.id);

    try {
      const res = await fetch('/api/upload/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        setUploadError(data.error || 'Failed to import file');
      } else if (data.document) {
        router.push(`/document/${data.document.id}`);
      }
    } catch {
      setUploadError('Network error during file import');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete document
  const handleDeleteDocument = async (docId: string, docTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${docTitle}"?`)) return;

    try {
      const res = await fetch(`/api/documents/${docId}?userId=${currentUser?.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter documents based on tab and search
  const myDocsCount = documents.filter((d) => d.ownerId === currentUser?.id).length;
  const sharedDocsCount = documents.filter((d) => d.ownerId !== currentUser?.id).length;

  const filteredDocuments = documents.filter((doc) => {
    // Tab filter
    if (activeTab === 'mine' && doc.ownerId !== currentUser?.id) return false;
    if (activeTab === 'shared' && doc.ownerId === currentUser?.id) return false;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(query);
      const matchContent = doc.content.toLowerCase().includes(query);
      const matchOwner = doc.owner?.name.toLowerCase().includes(query);
      return matchTitle || matchContent || matchOwner;
    }

    return true;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Ajaia Docs
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-text)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.05em',
                }}
              >
                PROD-READY
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Collaborative Document Editor inspired by Google Docs
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-faint)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, author, or snippet..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'var(--bg-subtle)';
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Right Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserSwitcher />
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '28px 24px 60px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Templates Banner */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Start a new document
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
              Pick a template or import a file
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleCreateDocument(tmpl.title, tmpl.content)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '110px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                    }}
                  >
                    {tmpl.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {tmpl.title}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {tmpl.subtitle}
                </p>
              </div>
            ))}

            {/* File Upload / Import Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1.5px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '110px',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'var(--primary-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown"
                style={{ display: 'none' }}
                onChange={(e) => handleFileImport(e.target.files)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <UploadCloud size={22} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {isUploading ? 'Importing doc...' : 'Import from File'}
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Upload <strong>.md</strong> or <strong>.txt</strong> to auto-convert into live editable doc
              </p>
            </div>
          </div>

          {uploadError && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                backgroundColor: 'var(--danger-subtle)',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger-text)',
                fontSize: '0.82rem',
              }}
            >
              {uploadError}
            </div>
          )}
        </section>

        {/* Documents Section Header & Tabs */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              paddingBottom: '2px',
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === 'all' ? 'var(--primary)' : 'transparent'}`,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>All Documents</span>
                <span
                  style={{
                    backgroundColor: activeTab === 'all' ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                    color: activeTab === 'all' ? 'var(--primary-text)' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {documents.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('mine')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: activeTab === 'mine' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === 'mine' ? 'var(--primary)' : 'transparent'}`,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>My Documents</span>
                <span
                  style={{
                    backgroundColor: activeTab === 'mine' ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                    color: activeTab === 'mine' ? 'var(--primary-text)' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {myDocsCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('shared')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: activeTab === 'shared' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === 'shared' ? 'var(--primary)' : 'transparent'}`,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>Shared with Me</span>
                <span
                  style={{
                    backgroundColor: activeTab === 'shared' ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                    color: activeTab === 'shared' ? 'var(--primary-text)' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {sharedDocsCount}
                </span>
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {filteredDocuments.length} document{filteredDocuments.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Document Grid */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '8px' }}>
                <Clock size={28} color="var(--primary)" />
              </div>
              <p style={{ fontSize: '0.88rem' }}>Loading documents...</p>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredDocuments.map((doc) => {
                const isOwner = doc.ownerId === currentUser?.id;
                const isViewer = doc.currentUserRole === 'viewer';
                const plainSnippet = doc.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

                return (
                  <div
                    key={doc.id}
                    onClick={() => router.push(`/document/${doc.id}`)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Card Thumbnail / Preview Banner */}
                    <div
                      style={{
                        height: '110px',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.5,
                          opacity: 0.85,
                        }}
                      >
                        {plainSnippet.slice(0, 180)}...
                      </div>

                      {/* Role Badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          backgroundColor: isOwner
                            ? 'var(--primary-subtle)'
                            : isViewer
                            ? 'var(--warning-subtle)'
                            : 'var(--success-subtle)',
                          color: isOwner
                            ? 'var(--primary-text)'
                            : isViewer
                            ? 'var(--warning-text)'
                            : 'var(--success-text)',
                        }}
                      >
                        {doc.currentUserRole}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            marginBottom: '6px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={doc.title}
                        >
                          {doc.title}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          <span>{doc.owner?.avatar || '👤'}</span>
                          <span>{isOwner ? 'You (Owner)' : doc.owner?.name}</span>
                          <span>&bull;</span>
                          <span>{doc.wordCount || 0} words</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div
                        style={{
                          marginTop: '14px',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareTargetDoc(doc);
                            }}
                            title="Manage Sharing"
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Users size={14} />
                            <span>Share</span>
                          </button>

                          {isOwner && (
                            <button
                              onClick={(e) => handleDeleteDocument(doc.id, doc.title, e)}
                              title="Delete document"
                              style={{
                                padding: '4px',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--danger)',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-subtle)')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-strong)',
              }}
            >
              <FileText size={40} style={{ margin: '0 auto 12px', color: 'var(--text-faint)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {searchQuery ? 'No matching documents found' : 'No documents in this view'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {searchQuery
                  ? 'Try a different keyword or clear your search filter.'
                  : activeTab === 'mine'
                  ? 'Create your first document using the templates above.'
                  : 'No documents have been shared with your active account yet.'}
              </p>
              <button
                onClick={() => handleCreateDocument('Untitled Document')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Plus size={16} />
                <span>Create New Document</span>
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Share Modal if invoked from dashboard card */}
      {shareTargetDoc && (
        <ShareModal
          document={shareTargetDoc}
          isOpen={!!shareTargetDoc}
          onClose={() => setShareTargetDoc(null)}
          onDocumentUpdated={(updated) => {
            setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            setShareTargetDoc(updated);
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <UserProvider>
      <DashboardContent />
    </UserProvider>
  );
}
