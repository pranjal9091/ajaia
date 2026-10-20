'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DocumentItem } from '@/lib/types';
import { UserProvider, useUser } from '@/context/UserContext';
import { DocumentEditor } from '@/components/Editor/DocumentEditor';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function DocumentPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { currentUser, isLoading: isUserLoading } = useUser();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading || !id) return;

    const userId = currentUser?.id || 'user_alice';

    fetch(`/api/documents/${id}?userId=${userId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load document');
        }
        setDocument(data.document);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, currentUser, isUserLoading]);

  if (isUserLoading || isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Opening document...</span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '32px',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <AlertCircle size={44} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Document Unavailable
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {error || 'This document either does not exist or has not been shared with your current account.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: 'var(--text-main)',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Documents</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <DocumentEditor initialDocument={document} />;
}

export default function DocumentPage() {
  return (
    <UserProvider>
      <React.Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Loader2 size={32} className="animate-spin" color="var(--primary)" />
          </div>
        }
      >
        <DocumentPageContent />
      </React.Suspense>
    </UserProvider>
  );
}
