import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gameAPI, userAPI } from '../services/api';
import { authService } from '../services/auth';

const Games = () => {
    const [games, setGames] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadData, setUploadData] = useState({
        file: null,
        whitePlayerId: '',
        blackPlayerId: '',
        result: '1-0',
        playedAt: new Date().toISOString().split('T')[0]
    });

    const user = authService.getUser();
    const canManage = user && (user.roles.includes('MANAGER') || user.roles.includes('ORGANIZER') || user.roles.includes('ADMIN'));

    useEffect(() => {
        fetchGames();
        fetchUsers();
    }, []);

    const fetchGames = async () => {
        try {
            const response = await gameAPI.getAll();
            setGames(response.data);
        } catch (err) {
            setError('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userAPI.getLeaderboard();
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to load users');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('whitePlayerId', uploadData.whitePlayerId);
        formData.append('blackPlayerId', uploadData.blackPlayerId);
        formData.append('result', uploadData.result);
        formData.append('playedAt', uploadData.playedAt);

        try {
            await gameAPI.uploadFile(formData);
            setSuccess('Game uploaded successfully!');
            setShowUpload(false);
            setUploadData({
                file: null,
                whitePlayerId: '',
                blackPlayerId: '',
                result: '1-0',
                playedAt: new Date().toISOString().split('T')[0]
            });
            fetchGames();
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        }
    };

    const handleApprove = async (gameId) => {
        setError('');
        setSuccess('');
        try {
            await gameAPI.approve(gameId);
            setSuccess('Game approved successfully!');
            fetchGames();
        } catch (err) {
            setError(err.response?.data?.message || 'Approval failed');
        }
    };

    const handleReject = async (gameId) => {
        if (!window.confirm('Are you sure you want to reject this game?')) return;

        setError('');
        setSuccess('');
        try {
            await gameAPI.reject(gameId);
            setSuccess('Game rejected successfully!');
            fetchGames();
        } catch (err) {
            setError(err.response?.data?.message || 'Rejection failed');
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    return (
        <div className="container">
            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2 className="card-title" style={{marginBottom: 0}}>Games</h2>
                    {canManage && (
                        <button onClick={() => setShowUpload(!showUpload)} className="btn btn-primary">
                            {showUpload ? 'Cancel' : 'Upload Game'}
                        </button>
                    )}
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {showUpload && (
                    <div style={{background: 'var(--off-white)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem'}}>
                        <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem'}}>Upload PGN File</h3>
                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label className="form-label">PGN File</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept=".pgn"
                                    onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                                    required
                                />
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="form-group">
                                    <label className="form-label">White Player</label>
                                    <select
                                        className="form-control"
                                        value={uploadData.whitePlayerId}
                                        onChange={(e) => setUploadData({...uploadData, whitePlayerId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select player</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Black Player</label>
                                    <select
                                        className="form-control"
                                        value={uploadData.blackPlayerId}
                                        onChange={(e) => setUploadData({...uploadData, blackPlayerId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select player</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="form-group">
                                    <label className="form-label">Result</label>
                                    <select
                                        className="form-control"
                                        value={uploadData.result}
                                        onChange={(e) => setUploadData({...uploadData, result: e.target.value})}
                                        required
                                    >
                                        <option value="1-0">1-0 (White wins)</option>
                                        <option value="0-1">0-1 (Black wins)</option>
                                        <option value="1/2-1/2">1/2-1/2 (Draw)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date Played</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={uploadData.playedAt}
                                        onChange={(e) => setUploadData({...uploadData, playedAt: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Upload</button>
                        </form>
                    </div>
                )}

                <table className="table">
                    <thead>
                    <tr>
                        <th>White</th>
                        <th>Black</th>
                        <th>Result</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {games.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{textAlign: 'center', color: 'var(--gray)'}}>No games uploaded yet</td>
                        </tr>
                    ) : (
                        games.map(game => (
                            <tr key={game.id}>
                                <td>{game.whitePlayer?.fullName || 'N/A'}</td>
                                <td>{game.blackPlayer?.fullName || 'N/A'}</td>
                                <td style={{fontWeight: '600'}}>{game.result || 'N/A'}</td>
                                <td>{game.gameDate || 'N/A'}</td>
                                <td>
                                    <span className={`badge ${game.approved ? 'badge-admin' : 'badge-player'}`}>
                                        {game.approved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                        {game.s3Key && (
                                            <>
                                                <Link
                                                    to={`/games/${game.id}/view`}
                                                    className="btn btn-secondary"
                                                    style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                                                    View
                                                </Link>
                                                <a href={`https://netchess-pgn-files-01.s3.eu-north-1.amazonaws.com/${game.s3Key}`}
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   download
                                                   className="btn btn-secondary"
                                                   style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                                                    Download
                                                </a>
                                            </>
                                        )}
                                        {canManage && !game.approved && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(game.id)}
                                                    className="btn btn-primary"
                                                    style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(game.id)}
                                                    className="btn btn-danger"
                                                    style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Games;