'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  switchUser: () => {},
  isLoading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('user_alice');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved user selection
    const saved = localStorage.getItem('ajaia_active_user_id');
    if (saved) {
      setCurrentUserId(saved);
    }

    // Fetch seed users
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.users) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('ajaia_active_user_id', userId);
  };

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || null;

  return (
    <UserContext.Provider value={{ currentUser, users, switchUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
