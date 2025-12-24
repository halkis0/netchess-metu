import React, { useState, useEffect } from 'react';
import { userAPI, puzzleAPI } from '../services/api';
import { authService } from '../services/auth';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const Dashboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = authService.getUser();

    const [puzzle, setPuzzle] = useState(null);
    const [puzzleChess, setPuzzleChess] = useState(null);
    const [currentPosition, setCurrentPosition] = useState('start');
    const [solutionMoves, setSolutionMoves] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [puzzleResult, setPuzzleResult] = useState('');
    const [puzzleCompleted, setPuzzleCompleted] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
        fetchDailyPuzzle();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await userAPI.getLeaderboard();
            setLeaderboard(response.data);
        } catch (err) {
            setError('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchDailyPuzzle = async () => {
        try {
            const response = await puzzleAPI.getDaily();
            if (response.data && response.data.fenPosition) {
                const puzzleData = response.data;
                setPuzzle(puzzleData);

                const chess = new Chess(puzzleData.fenPosition);
                setPuzzleChess(chess);
                setCurrentPosition(puzzleData.fenPosition);

                const moves = puzzleData.solution.split('|').map(m => m.trim());
                setSolutionMoves(moves);
                setCurrentMoveIndex(0);
            }
        } catch (err) {
            console.error('Failed to load daily puzzle');
        }
    };

    const checkPuzzleMove = (sourceSquare, targetSquare, piece) => {
        if (puzzleCompleted || !puzzleChess) return false;

        const expectedMove = solutionMoves[currentMoveIndex];
        if (!expectedMove) return false;

        try {
            const tempChess = new Chess(currentPosition);
            const move = tempChess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });

            if (!move) return false;

            const moveNotation = move.san;
            const expectedClean = expectedMove.replace(/[+#!?]/g, '');
            const actualClean = moveNotation.replace(/[+#!?]/g, '');

            if (actualClean === expectedClean) {
                const newPosition = tempChess.fen();
                setCurrentPosition(newPosition);
                setPuzzleChess(tempChess);

                const nextIndex = currentMoveIndex + 1;

                if (nextIndex >= solutionMoves.length) {
                    setPuzzleResult('correct');
                    setPuzzleCompleted(true);
                    return true;
                }

                setTimeout(() => {
                    const opponentMove = solutionMoves[nextIndex];
                    if (opponentMove) {
                        const opponentChess = new Chess(newPosition);
                        try {
                            opponentChess.move(opponentMove);
                            setCurrentPosition(opponentChess.fen());
                            setPuzzleChess(opponentChess);
                            setCurrentMoveIndex(nextIndex + 1);

                            if (nextIndex + 1 >= solutionMoves.length) {
                                setPuzzleResult('correct');
                                setPuzzleCompleted(true);
                            }
                        } catch (err) {
                            console.error('Opponent move failed:', err);
                        }
                    }
                }, 500);

                return true;
            } else {
                setPuzzleResult('wrong');
                setTimeout(() => setPuzzleResult(''), 1000);
                return false;
            }
        } catch (err) {
            return false;
        }
    };

    const resetPuzzle = () => {
        if (puzzle) {
            const chess = new Chess(puzzle.fenPosition);
            setPuzzleChess(chess);
            setCurrentPosition(puzzle.fenPosition);
            setCurrentMoveIndex(0);
            setPuzzleResult('');
            setPuzzleCompleted(false);
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    return (
        <div className="container">
            <div className="card">
                <h2 className="card-title">Welcome, {user?.fullName}</h2>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
                    <div style={{padding: '1.5rem', background: 'var(--off-white)', borderRadius: '8px', borderLeft: '4px solid var(--primary-red)'}}>
                        <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.5rem'}}>Your Rating</div>
                        <div style={{fontSize: '2rem', fontWeight: '700', color: 'var(--primary-red)'}}>{user?.nccElo || 1200}</div>
                    </div>
                    <div style={{padding: '1.5rem', background: 'var(--off-white)', borderRadius: '8px', borderLeft: '4px solid var(--primary-red)'}}>
                        <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.5rem'}}>Games Played</div>
                        <div style={{fontSize: '2rem', fontWeight: '700', color: 'var(--primary-red)'}}>{user?.gamesPlayed || 0}</div>
                    </div>
                    <div style={{padding: '1.5rem', background: 'var(--off-white)', borderRadius: '8px', borderLeft: '4px solid var(--primary-red)'}}>
                        <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.5rem'}}>Your Role</div>
                        <div style={{fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-dark)', marginTop: '0.75rem'}}>
                            <span className={`badge badge-${user?.roles[0]?.toLowerCase()}`}>{user?.roles[0]}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                {puzzle && (
                    <div className="card">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                            <h2 className="card-title" style={{marginBottom: 0}}>Daily Puzzle 🧩</h2>
                            <button onClick={resetPuzzle} className="btn btn-secondary" style={{padding: '0.5rem 1rem'}}>
                                Reset
                            </button>
                        </div>

                        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
              <span className={`badge badge-${puzzle.difficulty === 'EASY' ? 'player' : puzzle.difficulty === 'MEDIUM' ? 'organizer' : 'admin'}`}>
                {puzzle.difficulty}
              </span>
                            <span className="badge badge-manager">
                {puzzle.movesCount} {puzzle.movesCount === 1 ? 'move' : 'moves'}
              </span>
                        </div>

                        <p style={{color: 'var(--gray)', marginBottom: '1.5rem', fontSize: '0.875rem'}}>
                            {puzzle.hint}
                        </p>

                        <div style={{maxWidth: '400px', margin: '0 auto'}}>
                            <Chessboard
                                id={`puzzle-${puzzle.id}-${currentMoveIndex}`}
                                position={currentPosition}
                                boardWidth={400}
                                onPieceDrop={checkPuzzleMove}
                                arePiecesDraggable={!puzzleCompleted}
                                customBoardStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>

                        <div style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray)'}}>
                            Your move {Math.floor(currentMoveIndex / 2) + 1} of {puzzle.movesCount}
                        </div>

                        {puzzleResult === 'correct' && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#d4edda',
                                color: '#155724',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontWeight: '600'
                            }}>
                                ✓ Puzzle solved! Excellent! 🎉
                            </div>
                        )}

                        {puzzleResult === 'wrong' && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: '#f8d7da',
                                color: '#721c24',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontWeight: '600'
                            }}>
                                ✗ Wrong move, try again!
                            </div>
                        )}
                    </div>
                )}

                <div className="card">
                    <h2 className="card-title">Leaderboard - Top Players</h2>
                    {error && <div className="alert alert-error">{error}</div>}
                    <div style={{maxHeight: '500px', overflowY: 'auto'}}>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Rating</th>
                                <th>Games</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaderboard.map((player, index) => (
                                <tr key={player.id} style={{background: player.id === user?.id ? 'rgba(220, 20, 60, 0.05)' : 'transparent'}}>
                                    <td style={{fontWeight: '600'}}>{index + 1}</td>
                                    <td>
                                        {player.fullName}
                                        {player.id === user?.id && <span style={{marginLeft: '0.5rem', color: 'var(--primary-red)', fontSize: '0.875rem'}}>(You)</span>}
                                    </td>
                                    <td style={{fontWeight: '600', color: 'var(--primary-red)'}}>{player.nccElo}</td>
                                    <td>{player.gamesPlayed}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;