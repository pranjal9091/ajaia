'use client';

import React, { useState, useRef } from 'react';
import { DocumentItem, DocumentAttachment } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import {
  Paperclip,
  UploadCloud,
  FileText,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Download,
  Trash2,
  X,
} from 'lucide-react';

interface AttachmentPanelProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: DocumentItem) => void;
}

export const AttachmentPanel: React.FC<AttachmentPanelProps> = ({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
}) => {
  const { currentUser } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isViewer = document.currentUserRole === 'viewer';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string, filename: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon size={20} color="var(--primary)" />;
    if (filename.endsWith('.md') || filename.endsWith('.txt')) return <FileCode size={20} color="var(--success)" />;
    if (mimeType.includes('pdf')) return <FileText size={20} color="var(--danger)" />;
    return <FileArchive size={20} color="var(--text-muted)" />;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', currentUser?.id || 'user_alice');

    try {
      const res = await fetch(`/api/documents/${document.id}/attachments`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Failed to upload attachment');
      } else {
        // Refresh doc
        const docRes = await fetch(`/api/documents/${document.id}?userId=${currentUser?.id}`);
        const docData = await docRes.json();
        if (docData.success) {
          onDocumentUpdated(docData.document);
        }
      }
    } catch {
      setErrorMessage('Upload failed due to network error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const res = await fetch(
        `/api/documents/${document.id}/attachments?attachmentId=${attachmentId}&userId=${currentUser?.id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        const docRes = await fetch(`/api/documents/${document.id}?userId=${currentUser?.id}`);
        const docData = await docRes.json();
        if (docData.success) {
          onDocumentUpdated(docData.document);
        }
      }
    } catch (err) {
      console.error('Delete attachment error:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '380px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
      }}
      className="animate-fade-in"
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Paperclip size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Attachments ({document.attachments?.length || 0})
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '4px',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {errorMessage && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--danger-subtle)',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Upload Dropzone */}
        {!isViewer && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-strong)'}`,
              backgroundColor: dragActive ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '20px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <UploadCloud
              size={32}
              style={{ color: dragActive ? 'var(--primary)' : 'var(--text-muted)', margin: '0 auto 8px' }}
            />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {isUploading ? 'Uploading file...' : 'Upload an attachment'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Drag & drop or click to browse.
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '6px' }}>
              Supported: PDF, Images, DOCX, TXT, MD, CSV (up to 10MB)
            </div>
          </div>
        )}

        {/* Attachments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {document.attachments && document.attachments.length > 0 ? (
            document.attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  {getFileIcon(att.mimeType, att.originalName)}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={att.originalName}
                    >
                      {att.originalName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatFileSize(att.sizeBytes)} &bull; {new Date(att.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <a
                    href={`/api/attachments/${att.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.originalName}
                    style={{
                      padding: '6px',
                      color: 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    title="Download attachment"
                  >
                    <Download size={16} />
                  </a>

                  {!isViewer && (
                    <button
                      onClick={() => handleDeleteAttachment(att.id)}
                      style={{
                        padding: '6px',
                        color: 'var(--danger)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      title="Remove attachment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <FileArchive size={36} style={{ margin: '0 auto 8px', color: 'var(--border-strong)' }} />
              <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>No attachments yet</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Associate research briefs, diagrams, or references with this document.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
