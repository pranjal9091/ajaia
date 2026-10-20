'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Check, ChevronDown, UserCircle2, ShieldAlert } from 'lucide-react';

export const UserSwitcher: React.FC = () => {
  const { currentUser, users, switchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch active reviewer user"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <span style={{ fontSize: '1.15rem' }}>{currentUser.avatar}</span>
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
            {currentUser.name}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {currentUser.title}
          </span>
        </div>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '2px' }} />
      </button>

      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '280px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '8px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: '6px 10px 8px 10px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.78rem' }}>
              <UserCircle2 size={14} />
              <span>TEST ACCOUNTS (SWITCH ROLES)</span>
            </div>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Switch perspectives to test Owner, Editor, and Viewer permission enforcement.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {users.map((user) => {
              const isActive = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                    transition: 'background var(--transition-fast)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{user.avatar}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? 'var(--primary-text)' : 'var(--text-main)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {user.email} &bull; {user.title}
                      </div>
                    </div>
                  </div>
                  {isActive && <Check size={16} color="var(--primary)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
