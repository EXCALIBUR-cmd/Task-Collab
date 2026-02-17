import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Boards from './pages/Boards';
import Board from './pages/Board';
import './styles/App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/boards" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <BoardProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/boards"
              element={
                <PrivateRoute>
                  <Boards />
                </PrivateRoute>
              }
            />
            <Route
              path="/board/:id"
              element={
                <PrivateRoute>
                  <Board />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/boards" />} />
          </Routes>
        </BoardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
