import React, { useState, useEffect } from 'react';
import { auditAPI, userAPI } from '../services/api';

const Admin = () => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        studentNumber: '',
        role: 'PLAYER'
    });

    useEffect(() => {
        fetchAuditLogs();
        fetchUsers();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const response = await auditAPI.getLogs();
            setLogs(response.data);
        } catch (err) {
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userAPI.getLeaderboard();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setError('');
        setSuccess('');
        try {
            await userAPI.updateRole(userId, newRole);
            setSuccess('Role updated successfully!');
            fetchUsers();
            fetchAuditLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Role update failed');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await userAPI.createUser(newUser);
            setSuccess('User created successfully!');
            setShowAddUser(false);
            setNewUser({
                username: '',
                password: '',
                email: '',
                fullName: '',
                studentNumber: '',
                role: 'PLAYER'
            });
            fetchUsers();
            fetchAuditLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleEditUser = (user) => {
        setEditingUser({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            studentNumber: user.studentNumber || '',
            role: user.roles[0],
            password: ''
        });
        setShowAddUser(false);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await userAPI.updateUser(editingUser.id, editingUser);
            setSuccess('User updated successfully!');
            setEditingUser(null);
            fetchUsers();
            fetchAuditLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        setError('');
        setSuccess('');

        try {
            await userAPI.deleteUser(userId);
            setSuccess('User deleted successfully!');
            fetchUsers();
            fetchAuditLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    return (
        <div className="container">
            <div className="card">
                <h2 className="card-title">Admin Panel</h2>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--light-gray)'}}>
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'users' ? '3px solid var(--primary-red)' : '3px solid transparent',
                            color: activeTab === 'users' ? 'var(--primary-red)' : 'var(--gray)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'audit' ? '3px solid var(--primary-red)' : '3px solid transparent',
                            color: activeTab === 'audit' ? 'var(--primary-red)' : 'var(--gray)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Audit Logs
                    </button>
                </div>

                {activeTab === 'users' && (
                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                            <h3 style={{fontSize: '1.25rem', margin: 0}}>User Management</h3>
                            <button onClick={() => {
                                setShowAddUser(!showAddUser);
                                setEditingUser(null);
                            }} className="btn btn-primary">
                                {showAddUser ? 'Cancel' : '+ Add User'}
                            </button>
                        </div>

                        {showAddUser && (
                            <div style={{background: 'var(--off-white)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem'}}>
                                <h4 style={{marginBottom: '1.5rem', fontSize: '1.1rem'}}>Create New User</h4>
                                <form onSubmit={handleAddUser}>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newUser.fullName}
                                                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Student Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newUser.studentNumber}
                                                onChange={(e) => setNewUser({...newUser, studentNumber: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={newUser.username}
                                                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                                required
                                                minLength="8"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Role</label>
                                            <select
                                                className="form-control"
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                            >
                                                <option value="PLAYER">PLAYER</option>
                                                <option value="MANAGER">MANAGER</option>
                                                <option value="ORGANIZER">ORGANIZER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>
                                        Create User
                                    </button>
                                </form>
                            </div>
                        )}

                        {editingUser && (
                            <div style={{background: '#fff3cd', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '2px solid #ffc107'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                                    <h4 style={{fontSize: '1.1rem', margin: 0}}>Edit User: {editingUser.username}</h4>
                                    <button onClick={() => setEditingUser(null)} className="btn btn-secondary">Cancel</button>
                                </div>
                                <form onSubmit={handleUpdateUser}>
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                        <div className="form-group">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingUser.fullName}
                                                onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Student Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingUser.studentNumber}
                                                onChange={(e) => setEditingUser({...editingUser, studentNumber: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingUser.username}
                                                onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={editingUser.email}
                                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">New Password (leave empty to keep current)</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={editingUser.password}
                                                onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                                                minLength="8"
                                                placeholder="Leave empty to keep current password"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Role</label>
                                            <select
                                                className="form-control"
                                                value={editingUser.role}
                                                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                            >
                                                <option value="PLAYER">PLAYER</option>
                                                <option value="MANAGER">MANAGER</option>
                                                <option value="ORGANIZER">ORGANIZER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>
                                        Update User
                                    </button>
                                </form>
                            </div>
                        )}

                        <table className="table">
                            <thead>
                            <tr>
                                <th>Username</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Student No</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{background: editingUser?.id === user.id ? '#fff3cd' : 'transparent'}}>
                                    <td>{user.username}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.studentNumber || 'N/A'}</td>
                                    <td>
                                        <span className={`badge badge-${user.roles[0]?.toLowerCase()}`}>
                                            {user.roles[0]}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', gap: '0.5rem'}}>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="btn btn-secondary"
                                                style={{padding: '0.5rem 1rem'}}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                className="btn btn-danger"
                                                style={{padding: '0.5rem 1rem'}}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div>
                        <h3 style={{fontSize: '1.25rem', marginBottom: '1rem'}}>System Audit Logs</h3>
                        {logs.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '3rem', color: 'var(--gray)'}}>
                                No audit logs available
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Details</th>
                                </tr>
                                </thead>
                                <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td><span className="badge badge-admin">{log.action}</span></td>
                                        <td>{log.user?.username || 'System'}</td>
                                        <td style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {log.details || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;