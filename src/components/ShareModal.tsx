'use client';

import React, { useState } from 'react';
import { DocumentItem, User, AccessLevel } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { X, UserPlus, Link2, Check, Shield, Trash2, Mail, Users } from 'lucide-react';

interface ShareModalProps {
  document: DocumentItem;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (updated: DocumentItem) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
}) => {
  const { currentUser, users } = useUser();
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<AccessLevel>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = document.ownerId === currentUser?.id;
  const isEditor = document.shares?.some(
    (s) => s.userId === currentUser?.id && s.accessLevel === 'editor'
  );
  const canManageSharing = isOwner || isEditor;

  // Potential teammates who don't already have access and are not the owner
  const availableTeammates = users.filter(
    (u) =>
      u.id !== document.ownerId &&
      !document.shares?.some((s) => s.userId === u.id)
  );

  const handleShare = async (emailOrId: string) => {
    if (!emailOrId) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmailOrId: emailOrId,
          accessLevel: selectedRole,
          currentUserId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Failed to share document');
      } else {
        setTargetEmail('');
        // Refresh document data
        const docRes = await fetch(`/api/documents/${document.id}?userId=${currentUser?.id}`);
        const docData = await docRes.json();
        if (docData.success) {
          onDocumentUpdated(docData.document);
        }
      }
    } catch {
      setErrorMessage('Network error while updating permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: AccessLevel) => {
    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmailOrId: targetUserId,
          accessLevel: newRole,
          currentUserId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const docRes = await fetch(`/api/documents/${document.id}?userId=${currentUser?.id}`);
        const docData = await docRes.json();
        if (docData.success) {
          onDocumentUpdated(docData.document);
        }
      }
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const handleRevoke = async (targetUserId: string) => {
    try {
      const res = await fetch(
        `/api/documents/${document.id}/share?targetUserId=${targetUserId}&currentUserId=${currentUser?.id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        const docRes = await fetch(`/api/documents/${document.id}?userId=${currentUser?.id}`);
        const docData = await docRes.json();
        if (docData.success) {
          onDocumentUpdated(docData.document);
        }
      } else {
        setErrorMessage(data.error);
      }
    } catch {
      setErrorMessage('Failed to revoke access');
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Share Document
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              &ldquo;{document.title}&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-subtle)',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger-text)',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Invite Form */}
        {canManageSharing ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Add collaborators
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-faint)' }} />
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="Enter teammate email (e.g. bob@ajaia.io)"
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleShare(targetEmail);
                    }
                  }}
                />
              </div>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AccessLevel)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                }}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                onClick={() => handleShare(targetEmail)}
                disabled={!targetEmail || isSubmitting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: targetEmail ? 'var(--primary)' : 'var(--border-subtle)',
                  color: targetEmail ? '#ffffff' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {isSubmitting ? 'Sharing...' : 'Share'}
              </button>
            </div>

            {/* Quick add suggestions */}
            {availableTeammates.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick add:</span>
                {availableTeammates.map((teammate) => (
                  <button
                    key={teammate.id}
                    onClick={() => handleShare(teammate.email)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                  >
                    <span>{teammate.avatar}</span>
                    <span>{teammate.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--warning-subtle)',
              border: '1px solid #fef3c7',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--warning-text)',
              marginBottom: '16px',
            }}
          >
            <strong>Viewer Mode:</strong> Only Document Owners and Editors can invite new collaborators.
          </div>
        )}

        {/* Members with Access */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            <Users size={14} />
            <span>PEOPLE WITH ACCESS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Owner Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>{document.owner?.avatar || '👤'}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {document.owner?.name || 'Owner'}
                    {document.ownerId === currentUser?.id && ' (You)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {document.owner?.email}
                  </div>
                </div>
              </div>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-text)',
                }}
              >
                Owner
              </span>
            </div>

            {/* Shares Rows */}
            {document.shares && document.shares.length > 0 ? (
              document.shares.map((share) => {
                const user = share.user || users.find((u) => u.id === share.userId);
                return (
                  <div
                    key={share.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{user?.avatar || '👤'}</span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {user?.name || share.userId}
                          {share.userId === currentUser?.id && ' (You)'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {user?.email || 'Collaborator'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {canManageSharing ? (
                        <>
                          <select
                            value={share.accessLevel}
                            onChange={(e) => handleRoleChange(share.userId, e.target.value as AccessLevel)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: '#ffffff',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                            }}
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          {isOwner && (
                            <button
                              onClick={() => handleRevoke(share.userId)}
                              title="Revoke access"
                              style={{
                                padding: '4px',
                                color: 'var(--danger)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      ) : (
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: share.accessLevel === 'editor' ? 'var(--success-subtle)' : 'var(--bg-subtle)',
                            color: share.accessLevel === 'editor' ? 'var(--success-text)' : 'var(--text-muted)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {share.accessLevel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No external collaborators shared yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer: Copy Link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={handleCopyLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: copiedLink ? 'var(--success-subtle)' : '#ffffff',
              color: copiedLink ? 'var(--success-text)' : 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}
          >
            {copiedLink ? <Check size={16} /> : <Link2 size={16} />}
            <span>{copiedLink ? 'Link copied!' : 'Copy link'}</span>
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--text-main)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
