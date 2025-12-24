import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { authService } from './services/auth';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import Tournaments from './pages/Tournaments';
import Manager from './pages/Manager';
import Admin from './pages/Admin';
import GameViewer from './pages/GameViewer';
import PuzzleManagement from './pages/PuzzleManagement';

const PrivateRoute = ({ children, roles }) => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/" />;
    }
    if (roles && !authService.hasAnyRole(roles)) {
        return <Navigate to="/dashboard" />;
    }
    return children;
};

function AppContent() {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const location = useLocation();

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
    }, [location]);

    return (
        <>
            {isAuthenticated && <Navbar />}
            <Routes>
                <Route path="/" element={
                    isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
                } />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/games" element={<PrivateRoute><Games /></PrivateRoute>} />
                <Route path="/games/:id/view" element={<PrivateRoute><GameViewer /></PrivateRoute>} />
                <Route path="/tournaments" element={
                    <PrivateRoute roles={['ORGANIZER', 'ADMIN']}>
                        <Tournaments />
                    </PrivateRoute>
                } />
                <Route path="/manager" element={
                    <PrivateRoute roles={['MANAGER', 'ADMIN']}>
                        <Manager />
                    </PrivateRoute>
                } />
                <Route path="/admin" element={
                    <PrivateRoute roles={['ADMIN']}>
                        <Admin />
                    </PrivateRoute>
                } />
                <Route path="/puzzles" element={
                    <PrivateRoute roles={['ORGANIZER', 'ADMIN']}>
                        <PuzzleManagement />
                    </PrivateRoute>
                } />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;