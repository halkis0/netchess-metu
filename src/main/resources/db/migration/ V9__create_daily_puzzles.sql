CREATE TABLE daily_puzzles (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               puzzle_date DATE NOT NULL UNIQUE,
                               fen_position VARCHAR(100) NOT NULL,
                               solution TEXT NOT NULL,
                               moves_count INTEGER NOT NULL DEFAULT 1,
                               hint TEXT,
                               difficulty VARCHAR(20) DEFAULT 'MEDIUM',
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_daily_puzzles_date ON daily_puzzles(puzzle_date);

INSERT INTO daily_puzzles (puzzle_date, fen_position, solution, moves_count, hint, difficulty) VALUES
                                                                                                   ('2025-12-22', 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', 'Qxf7#', 1, 'Checkmate in 1 move!', 'EASY'),
                                                                                                   ('2025-12-23', 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5', 'Bxf7+|Kxf7|Ng5+', 2, 'Win the queen with a discovered attack', 'MEDIUM'),
                                                                                                   ('2025-12-24', 'r1b1kb1r/pppp1ppp/2n2q2/4P3/2Bn4/5N2/PPP2PPP/RNBQK2R w KQkq - 0 7', 'Bxf7+|Kxf7|Ng5+|Kg8|Qxf6', 3, 'Classic Greek Gift sacrifice!', 'HARD');