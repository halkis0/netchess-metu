import React, { useState, useEffect } from 'react';
import { tournamentAPI, roomAPI } from '../services/api';
import {authService} from "../services/auth";

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const user = authService.getUser();
    const canCreate = user && (user.roles.includes('ORGANIZER') || user.roles.includes('ADMIN'));
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        maxParticipants: 32,
        roomId: ''
    });

    useEffect(() => {
        fetchTournaments();
        fetchRooms();
    }, []);

    const fetchTournaments = async () => {
        try {
            const response = await tournamentAPI.getAll();
            setTournaments(response.data);
        } catch (err) {
            setError('Failed to load tournaments');
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await roomAPI.getAll();
            setRooms(response.data);
        } catch (err) {
            console.error('Failed to load rooms');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await tournamentAPI.create(formData);
            setSuccess('Tournament created successfully!');
            setShowCreate(false);
            setFormData({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                maxParticipants: 32,
                roomId: ''
            });
            fetchTournaments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create tournament');
        }
    };

    const handleRegister = async (tournamentId) => {
        try {
            await tournamentAPI.register(tournamentId);
            setSuccess('Registered successfully!');
            fetchTournaments();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    return (
        <div className="container">
            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 className="card-title" style={{marginBottom: 0}}>Tournaments</h2>
                    {canCreate && (
                    <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
                        {showCreate ? 'Cancel' : 'Create Tournament'}
                    </button>
                )}
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {showCreate && (
                    <div style={{background: 'var(--off-white)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem'}}>
                        <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem'}}>Create New Tournament</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Tournament Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="form-group">
                                    <label className="form-label">Max Participants</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                                        min="4"
                                        max="128"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Room</label>
                                    <select
                                        className="form-control"
                                        value={formData.roomId}
                                        onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select room</option>
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id}>{room.name} (Capacity: {room.capacity})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {canCreate && (
                                <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
                                    {showCreate ? 'Cancel' : 'Create Tournament'}
                                </button>
                            )}
                        </form>
                    </div>
                )}

                <div style={{display: 'grid', gap: '1rem'}}>
                    {tournaments.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '3rem', color: 'var(--gray)'}}>
                            No tournaments created yet
                        </div>
                    ) : (
                        tournaments.map(tournament => (
                            <div key={tournament.id} style={{border: '1px solid var(--light-gray)', borderRadius: '8px', padding: '1.5rem'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem'}}>
                                    <div>
                                        <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem'}}>{tournament.name}</h3>
                                        <p style={{color: 'var(--gray)', margin: 0}}>{tournament.description}</p>
                                    </div>
                                    <span className={`badge badge-${tournament.status === 'UPCOMING' ? 'player' : tournament.status === 'ONGOING' ? 'organizer' : 'admin'}`}>
                    {tournament.status}
                  </span>
                                </div>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
                                    <div>
                                        <div style={{fontSize: '0.875rem', color: 'var(--gray)'}}>Start Date</div>
                                        <div style={{fontWeight: '500'}}>{new Date(tournament.startDate).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{fontSize: '0.875rem', color: 'var(--gray)'}}>End Date</div>
                                        <div style={{fontWeight: '500'}}>{new Date(tournament.endDate).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{fontSize: '0.875rem', color: 'var(--gray)'}}>Participants</div>
                                        <div style={{fontWeight: '500'}}>{tournament.currentParticipants || 0} / {tournament.maxParticipants}</div>
                                    </div>
                                    <div>
                                        <button onClick={() => handleRegister(tournament.id)} className="btn btn-secondary" style={{marginTop: '0.5rem'}}>
                                            Register
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tournaments;