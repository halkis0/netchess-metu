import React, { useState, useEffect } from 'react';
import { puzzleAPI } from '../services/api';
import { Chessboard } from 'react-chessboard';

const PuzzleManagement = () => {
    const [puzzles, setPuzzles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddPuzzle, setShowAddPuzzle] = useState(false);
    const [editingPuzzle, setEditingPuzzle] = useState(null);
    const [newPuzzle, setNewPuzzle] = useState({
        puzzleDate: '',
        fenPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        solution: '',
        movesCount: 1,
        hint: '',
        difficulty: 'MEDIUM'
    });

    useEffect(() => {
        fetchPuzzles();
    }, []);

    const fetchPuzzles = async () => {
        try {
            const response = await puzzleAPI.getAll();
            setPuzzles(response.data);
        } catch (err) {
            setError('Failed to load puzzles');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPuzzle = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await puzzleAPI.create(newPuzzle);
            setSuccess('Puzzle created successfully!');
            setShowAddPuzzle(false);
            setNewPuzzle({
                puzzleDate: '',
                fenPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                solution: '',
                movesCount: 1,
                hint: '',
                difficulty: 'MEDIUM'
            });
            fetchPuzzles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create puzzle');
        }
    };

    const handleEditPuzzle = (puzzle) => {
        setEditingPuzzle({
            id: puzzle.id,
            puzzleDate: puzzle.puzzleDate,
            fenPosition: puzzle.fenPosition,
            solution: puzzle.solution,
            movesCount: puzzle.movesCount,
            hint: puzzle.hint,
            difficulty: puzzle.difficulty
        });
        setShowAddPuzzle(false);
    };

    const handleUpdatePuzzle = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!editingPuzzle || !editingPuzzle.id) {
            setError('Invalid puzzle ID');
            return;
        }

        try {
            await puzzleAPI.update(editingPuzzle.id, editingPuzzle);
            setSuccess('Puzzle updated successfully!');
            setEditingPuzzle(null);
            fetchPuzzles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update puzzle');
        }
    };

    const handleDeletePuzzle = async (puzzleId, puzzleDate) => {
        if (!puzzleId) {
            setError('Invalid puzzle ID');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete puzzle for ${puzzleDate}?`)) {
            return;
        }

        setError('');
        setSuccess('');

        try {
            await puzzleAPI.delete(puzzleId);
            setSuccess('Puzzle deleted successfully!');
            fetchPuzzles();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete puzzle');
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    return (
        <div className="container">
            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                    <h2 className="card-title">Daily Puzzle Management</h2>
                    <button onClick={() => {
                        setShowAddPuzzle(!showAddPuzzle);
                        setEditingPuzzle(null);
                    }} className="btn btn-primary">
                        {showAddPuzzle ? 'Cancel' : '+ Add Puzzle'}
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {showAddPuzzle && (
                    <div style={{background: 'var(--off-white)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem'}}>
                        <h4 style={{marginBottom: '1.5rem', fontSize: '1.1rem'}}>Create New Puzzle</h4>
                        <form onSubmit={handleAddPuzzle}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={newPuzzle.puzzleDate}
                                        onChange={(e) => setNewPuzzle({...newPuzzle, puzzleDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Difficulty</label>
                                    <select
                                        className="form-control"
                                        value={newPuzzle.difficulty}
                                        onChange={(e) => setNewPuzzle({...newPuzzle, difficulty: e.target.value})}
                                    >
                                        <option value="EASY">EASY</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HARD">HARD</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">FEN Position</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newPuzzle.fenPosition}
                                        onChange={(e) => setNewPuzzle({...newPuzzle, fenPosition: e.target.value})}
                                        required
                                        placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Solution (format: move1|move2|move3)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newPuzzle.solution}
                                        onChange={(e) => setNewPuzzle({...newPuzzle, solution: e.target.value})}
                                        required
                                        placeholder="Qxf7# or Bxf7+|Kxf7|Ng5+"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Moves Count (player moves only)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newPuzzle.movesCount}
                                        onChange={(e) => setNewPuzzle({...newPuzzle, movesCount: parseInt(e.target.value)})}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hint</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newPuzzle.hint}
                                        onChange={(e) => setNewPuzzle({...newPuzzle, hint: e.target.value})}
                                        placeholder="Checkmate in 1 move!"
                                    />
                                </div>
                            </div>
                            <div style={{marginTop: '1rem'}}>
                                <div style={{maxWidth: '300px', margin: '0 auto'}}>
                                    <Chessboard
                                        position={newPuzzle.fenPosition}
                                        boardWidth={300}
                                        arePiecesDraggable={false}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>
                                Create Puzzle
                            </button>
                        </form>
                    </div>
                )}

                {editingPuzzle && (
                    <div style={{background: '#fff3cd', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '2px solid #ffc107'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                            <h4 style={{fontSize: '1.1rem', margin: 0}}>Edit Puzzle: {editingPuzzle.puzzleDate}</h4>
                            <button onClick={() => setEditingPuzzle(null)} className="btn btn-secondary">Cancel</button>
                        </div>
                        <form onSubmit={handleUpdatePuzzle}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={editingPuzzle.puzzleDate}
                                        onChange={(e) => setEditingPuzzle({...editingPuzzle, puzzleDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Difficulty</label>
                                    <select
                                        className="form-control"
                                        value={editingPuzzle.difficulty}
                                        onChange={(e) => setEditingPuzzle({...editingPuzzle, difficulty: e.target.value})}
                                    >
                                        <option value="EASY">EASY</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HARD">HARD</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">FEN Position</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPuzzle.fenPosition}
                                        onChange={(e) => setEditingPuzzle({...editingPuzzle, fenPosition: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Solution (format: move1|move2|move3)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPuzzle.solution}
                                        onChange={(e) => setEditingPuzzle({...editingPuzzle, solution: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Moves Count (player moves only)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={editingPuzzle.movesCount}
                                        onChange={(e) => setEditingPuzzle({...editingPuzzle, movesCount: parseInt(e.target.value)})}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hint</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPuzzle.hint}
                                        onChange={(e) => setEditingPuzzle({...editingPuzzle, hint: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{marginTop: '1rem'}}>
                                <div style={{maxWidth: '300px', margin: '0 auto'}}>
                                    <Chessboard
                                        position={editingPuzzle.fenPosition}
                                        boardWidth={300}
                                        arePiecesDraggable={false}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}}>
                                Update Puzzle
                            </button>
                        </form>
                    </div>
                )}

                <table className="table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Difficulty</th>
                        <th>Moves</th>
                        <th>Hint</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {puzzles.map(puzzle => (
                        <tr key={puzzle.id} style={{background: editingPuzzle?.id === puzzle.id ? '#fff3cd' : 'transparent'}}>
                            <td>{puzzle.puzzleDate}</td>
                            <td>
                                <span className={`badge badge-${puzzle.difficulty === 'EASY' ? 'player' : puzzle.difficulty === 'MEDIUM' ? 'organizer' : 'admin'}`}>
                                    {puzzle.difficulty}
                                </span>
                            </td>
                            <td>{puzzle.movesCount}</td>
                            <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>{puzzle.hint}</td>
                            <td>
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button
                                        onClick={() => handleEditPuzzle(puzzle)}
                                        className="btn btn-secondary"
                                        style={{padding: '0.5rem 1rem'}}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeletePuzzle(puzzle.id, puzzle.puzzleDate)}
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
        </div>
    );
};

export default PuzzleManagement;