import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for an active session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      const currentUser = { username: foundUser.username };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setUser(currentUser);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const register = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'User already exists' };
    }
    const newUser = { username, password, scores: {} };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    const currentUser = { username };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    setUser(currentUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const saveScore = (topic, score, total) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === user.username);
    if (userIndex !== -1) {
      if (!users[userIndex].scores) {
        users[userIndex].scores = {};
      }
      users[userIndex].scores[topic] = { score, total, date: new Date().toISOString() };
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  const getScores = () => {
    if (!user) return {};
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUserData = users.find(u => u.username === user.username);
    return currentUserData ? currentUserData.scores || {} : {};
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, saveScore, getScores }}>
      {children}
    </AuthContext.Provider>
  );
};
