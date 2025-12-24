import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { gameAPI } from '../services/api';

const GameViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [game, setGame] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [fenHistory, setFenHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGame();
    }, [id]);

    const fetchGame = async () => {
        try {
            const response = await gameAPI.getById(id);
            setGame(response.data);

            if (response.data.s3Key) {
                await loadPGN(response.data.s3Key);
            }
        } catch (err) {
            setError('Failed to load game');
        } finally {
            setLoading(false);
        }
    };

    const loadPGN = async (s3Key) => {
        try {
            const url = `https://netchess-pgn-files-01.s3.eu-north-1.amazonaws.com/${s3Key}`;
            const response = await fetch(url);
            let pgnContent = await response.text();

            const eventMatches = [...pgnContent.matchAll(/\[Event[^\]]*\]/g)];
            if (eventMatches.length > 1) {
                const secondEventPos = eventMatches[1].index;
                pgnContent = pgnContent.substring(0, secondEventPos).trim();
            }

            const tempChess = new Chess();
            tempChess.loadPgn(pgnContent);

            const history = tempChess.history({ verbose: true });
            setMoveHistory(history);

            const replayChess = new Chess();
            const fens = [];

            fens.push(replayChess.fen());

            history.forEach(move => {
                replayChess.move(move.san);
                fens.push(replayChess.fen());
            });

            setFenHistory(fens);
            setCurrentMoveIndex(-1);

        } catch (err) {
            setError('Failed to parse PGN: ' + err.message);
        }
    };

    const currentPosition = useMemo(() => {
        if (fenHistory.length === 0) return 'start';
        const fenIndex = currentMoveIndex + 1;
        return fenHistory[fenIndex] || fenHistory[0];
    }, [fenHistory, currentMoveIndex]);

    const goToMove = (index) => {
        if (index < -1 || index >= moveHistory.length) return;
        setCurrentMoveIndex(index);
    };

    const goToNext = () => goToMove(currentMoveIndex + 1);
    const goToPrevious = () => goToMove(currentMoveIndex - 1);
    const goToStart = () => goToMove(-1);
    const goToEnd = () => goToMove(moveHistory.length - 1);

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;
    if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

    return (
        <div className="container">
            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                    <h2 className="card-title" style={{marginBottom: 0}}>Game Viewer</h2>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
                </div>

                {game && (
                    <div style={{marginBottom: '2rem', padding: '1.5rem', background: 'var(--off-white)', borderRadius: '8px'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem'}}>
                            <div>
                                <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.5rem'}}>White</div>
                                <div style={{fontWeight: '700', fontSize: '1.5rem', color: 'var(--text-dark)'}}>
                                    {game.whitePlayer?.fullName || 'N/A'}
                                </div>
                                <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.25rem'}}>
                                    Rating: {game.whitePlayer?.nccElo || 1200}
                                </div>
                            </div>
                            <div>
                                <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.5rem'}}>Black</div>
                                <div style={{fontWeight: '700', fontSize: '1.5rem', color: 'var(--text-dark)'}}>
                                    {game.blackPlayer?.fullName || 'N/A'}
                                </div>
                                <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.25rem'}}>
                                    Rating: {game.blackPlayer?.nccElo || 1200}
                                </div>
                            </div>
                        </div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--light-gray)'}}>
                            <div>
                                <div style={{fontSize: '0.875rem', color: 'var(--gray)'}}>Result</div>
                                <div style={{fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary-red)'}}>{game.result || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{fontSize: '0.875rem', color: 'var(--gray)'}}>Date</div>
                                <div style={{fontWeight: '600'}}>{game.gameDate || 'N/A'}</div>
                            </div>
                            <div>
                                <div style={{fontSize: '0.875rem', color: 'var(--gray)'}}>Status</div>
                                <span className={`badge ${game.approved ? 'badge-admin' : 'badge-player'}`}>
                                    {game.approved ? 'Approved' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem'}}>
                    <div>
                        <div style={{maxWidth: '600px', margin: '0 auto'}}>
                            <Chessboard
                                id={`board-${currentMoveIndex}`}
                                position={currentPosition}
                                boardWidth={600}
                                arePiecesDraggable={false}
                                customBoardStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                            />
                        </div>

                        <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem'}}>
                            <button onClick={goToStart} disabled={currentMoveIndex === -1} className="btn btn-secondary" style={{padding: '0.75rem 1.5rem'}}>⏮ Start</button>
                            <button onClick={goToPrevious} disabled={currentMoveIndex === -1} className="btn btn-secondary" style={{padding: '0.75rem 1.5rem'}}>◀ Previous</button>
                            <button onClick={goToNext} disabled={currentMoveIndex === moveHistory.length - 1} className="btn btn-primary" style={{padding: '0.75rem 1.5rem'}}>Next ▶</button>
                            <button onClick={goToEnd} disabled={currentMoveIndex === moveHistory.length - 1} className="btn btn-secondary" style={{padding: '0.75rem 1.5rem'}}>End ⏭</button>
                        </div>

                        <div style={{textAlign: 'center', marginTop: '1rem', color: 'var(--gray)'}}>
                            Move {currentMoveIndex + 1} of {moveHistory.length}
                        </div>
                    </div>

                    <div>
                        <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>Moves</h3>
                        <div style={{background: 'var(--off-white)', padding: '1rem', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto'}}>
                            {moveHistory.length === 0 ? (
                                <div style={{color: 'var(--gray)', textAlign: 'center', padding: '2rem'}}>No moves to display</div>
                            ) : (
                                <div style={{display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '0.5rem'}}>
                                    {moveHistory.map((move, index) => {
                                        if (index % 2 === 0) {
                                            return (
                                                <React.Fragment key={index}>
                                                    <div style={{fontWeight: '600', color: 'var(--gray)'}}>{Math.floor(index / 2) + 1}.</div>
                                                    <button
                                                        onClick={() => goToMove(index)}
                                                        style={{
                                                            background: currentMoveIndex === index ? 'var(--primary-red)' : 'transparent',
                                                            color: currentMoveIndex === index ? 'var(--white)' : 'var(--text-dark)',
                                                            border: 'none',
                                                            padding: '0.5rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: '500',
                                                            textAlign: 'left',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {move.san}
                                                    </button>
                                                    {moveHistory[index + 1] && (
                                                        <button
                                                            onClick={() => goToMove(index + 1)}
                                                            style={{
                                                                background: currentMoveIndex === index + 1 ? 'var(--primary-red)' : 'transparent',
                                                                color: currentMoveIndex === index + 1 ? 'var(--white)' : 'var(--text-dark)',
                                                                border: 'none',
                                                                padding: '0.5rem',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500',
                                                                textAlign: 'left',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {moveHistory[index + 1].san}
                                                        </button>
                                                    )}
                                                </React.Fragment>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameViewer;