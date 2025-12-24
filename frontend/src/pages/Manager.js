import React, { useState, useEffect } from 'react';
import { gameAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Manager = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPendingGames();
    }, []);

    const fetchPendingGames = async () => {
        try {
            const response = await gameAPI.getAll();
            setGames(response.data.filter(game => !game.approved));
        } catch (err) {
            setError('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (gameId) => {
        setError('');
        setSuccess('');
        try {
            await gameAPI.approve(gameId);
            setSuccess('Game approved successfully!');
            fetchPendingGames();
        } catch (err) {
            setError(err.response?.data?.message || 'Approval failed');
        }
    };

    const handleReject = async (gameId) => {
        setError('');
        setSuccess('');
        try {
            await gameAPI.reject(gameId);
            setSuccess('Game rejected successfully!');
            fetchPendingGames();
        } catch (err) {
            setError(err.response?.data?.message || 'Rejection failed');
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    return (
        <div className="container">
            <div className="card">
                <h2 className="card-title">Game Approval - Manager Panel</h2>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {games.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '3rem', color: 'var(--gray)'}}>
                        No pending games to approve
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>White Player</th>
                            <th>Black Player</th>
                            <th>Result</th>
                            <th>Date Played</th>
                            <th>Uploaded By</th>
                            <th>PGN File</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {games.map(game => (
                            <tr key={game.id}>
                                <td>{game.whitePlayer?.fullName || 'N/A'}</td>
                                <td>{game.blackPlayer?.fullName || 'N/A'}</td>
                                <td style={{fontWeight: '600'}}>{game.result || 'N/A'}</td>
                                <td>{game.gameDate || 'N/A'}</td>
                                <td>{game.uploadedBy?.username || 'N/A'}</td>
                                <td>
                                    {game.s3Key && (
                                        <Link
                                            to={`/games/${game.id}/view`}
                                            style={{
                                                color: 'var(--primary-red)',
                                                textDecoration: 'none',
                                                fontWeight: 500
                                            }}>
                                            View Game
                                        </Link>
                                    )}
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        <button onClick={() => handleApprove(game.id)} className="btn btn-primary"
                                                style={{padding: '0.5rem 1rem'}}>
                                            Approve
                                        </button>
                                        <button onClick={() => handleReject(game.id)} className="btn btn-danger"
                                                style={{padding: '0.5rem 1rem'}}>
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Manager;