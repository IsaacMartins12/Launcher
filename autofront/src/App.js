import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeContext } from './assets/ThemeContext';

import Login from './components/Login';
import Aluno from './components/components_additionalH/Alunos/Alunos';
import Inst from './components/components_additionalH/Instituição/Inst';

import './components_css/Login.css';
import './App.css';

const ThemeProvider = ({ children }) => {
  const [theme] = useState({ colorBgContainer: '#fff' });
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Route guard component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Decode JWT payload to check role (without verification - just for routing)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/aluno" replace />;
    }
    if (requiredRole === 'student' && isAdmin) {
      return <Navigate to="/inst" replace />;
    }
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('is_admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aluno/*" element={
            <ProtectedRoute requiredRole="student">
              <Aluno />
            </ProtectedRoute>
          } />
          <Route path="/inst/*" element={
            <ProtectedRoute requiredRole="admin">
              <Inst />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function Home() {
  // If already logged in, redirect to appropriate page
  const token = localStorage.getItem('token');
  if (token) {
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    return <Navigate to={isAdmin ? '/inst' : '/aluno'} replace />;
  }
  return <Login />;
}

export default App;

