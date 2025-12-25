import React from 'react';
import { Chessboard } from 'react-chessboard';

const ChessNotation = ({ content }) => {

    const parseContent = (text) => {
        const parts = [];
        let lastIndex = 0;

        const fenRegex = /\[fen\](.*?)\[\/fen\]/gs;
        let fenMatch;

        while ((fenMatch = fenRegex.exec(text)) !== null) {

            if (fenMatch.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex, fenMatch.index)
                });
            }


            parts.push({
                type: 'fen',
                content: fenMatch[1].trim()
            });

            lastIndex = fenRegex.lastIndex;
        }


        const pgnRegex = /\[pgn\](.*?)\[\/pgn\]/gs;
        let pgnMatch;
        let tempText = text;


        parts.length = 0;
        lastIndex = 0;


        const combinedRegex = /\[(fen|pgn)\](.*?)\[\/\1\]/gs;
        let match;

        while ((match = combinedRegex.exec(text)) !== null) {

            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }


            parts.push({
                type: match[1],
                content: match[2].trim()
            });

            lastIndex = combinedRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }

        if (parts.length === 0) {
            parts.push({ type: 'text', content: text });
        }

        return parts;
    };

    const renderPart = (part, index) => {
        switch (part.type) {
            case 'fen':
                return (
                    <div key={index} style={{margin: '1rem 0', display: 'flex', justifyContent: 'center'}}>
                        <div style={{maxWidth: '400px', width: '100%'}}>
                            <Chessboard
                                position={part.content}
                                boardWidth={400}
                                arePiecesDraggable={false}
                            />
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                background: 'var(--off-white)',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all'
                            }}>
                                FEN: {part.content}
                            </div>
                        </div>
                    </div>
                );

            case 'pgn':
                return (
                    <div key={index} style={{
                        margin: '1rem 0',
                        padding: '1rem',
                        background: 'var(--off-white)',
                        borderRadius: '8px',
                        border: '1px solid var(--light-gray)'
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            color: 'var(--primary-red)'
                        }}>
                            ♟️ PGN Notation
                        </div>
                        <pre style={{
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            margin: 0,
                            lineHeight: '1.5'
                        }}>
                            {part.content}
                        </pre>
                    </div>
                );

            case 'text':
            default:
                return (
                    <span key={index} style={{whiteSpace: 'pre-wrap'}}>
                        {part.content}
                    </span>
                );
        }
    };

    const parts = parseContent(content);

    return (
        <div>
            {parts.map((part, index) => renderPart(part, index))}
        </div>
    );
};

export default ChessNotation;