import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { authService } from '../services/auth';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);
            authService.setToken(response.data.token);

            const userResponse = await authAPI.getCurrentUser();
            authService.setUser(userResponse.data);

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem'}}>
                    <img src="/odtu-logo.png" alt="ODTÜ" style={{height: '60px'}} />
                    <img src="/chess-logo.png" alt="Chess" style={{height: '60px'}} />
                </div>
                <h1 className="auth-title">NetChess</h1>
                <p style={{textAlign: 'center', color: 'var(--gray)', marginBottom: '2rem'}}>
                    METU NCC Chess Club
                </p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray)'}}>
                    Don't have an account? <Link to="/register" style={{color: 'var(--primary-red)', fontWeight: 500}}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;