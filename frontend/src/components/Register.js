import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        studentNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authAPI.register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.password ||'Registration failed');

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
                <h1 className="auth-title">Register</h1>
                <p style={{textAlign: 'center', color: 'var(--gray)', marginBottom: '2rem'}}>
                    Join METU NCC Chess Club
                </p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Student Number</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., 2637387"
                            value={formData.studentNumber}
                            onChange={(e) => setFormData({...formData, studentNumber: e.target.value})}
                            required
                            minLength="7"
                            maxLength="20"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray)'}}>
                    Already have an account? <Link to="/"
                                                   style={{color: 'var(--primary-red)', fontWeight: 500}}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;