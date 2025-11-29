CREATE TABLE users (
                       id UUID PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100),
                       ncc_elo INTEGER NOT NULL DEFAULT 1200,
                       games_played INTEGER NOT NULL DEFAULT 0,
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP NOT NULL,
                       updated_at TIMESTAMP
);

CREATE TABLE user_roles (
                            user_id UUID NOT NULL,
                            role VARCHAR(20) NOT NULL,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE rooms (
                       id UUID PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       location VARCHAR(255),
                       capacity INTEGER NOT NULL,
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP NOT NULL,
                       updated_at TIMESTAMP
);

CREATE TABLE tournaments (
                             id UUID PRIMARY KEY,
                             name VARCHAR(200) NOT NULL,
                             description TEXT,
                             start_date TIMESTAMP NOT NULL,
                             end_date TIMESTAMP NOT NULL,
                             room_id UUID,
                             max_participants INTEGER NOT NULL,
                             current_participants INTEGER NOT NULL DEFAULT 0,
                             status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                             organizer_id UUID NOT NULL,
                             created_at TIMESTAMP NOT NULL,
                             updated_at TIMESTAMP,
                             FOREIGN KEY (room_id) REFERENCES rooms(id),
                             FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE TABLE games (
                       id UUID PRIMARY KEY,
                       event VARCHAR(200),
                       site VARCHAR(100),
                       game_date DATE,
                       round VARCHAR(50),
                       white_player VARCHAR(100),
                       black_player VARCHAR(100),
                       result VARCHAR(20),
                       eco VARCHAR(10),
                       pgn_content TEXT,
                       s3_key VARCHAR(500),
                       uploaded_by UUID NOT NULL,
                       tournament_id UUID,
                       approved BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at TIMESTAMP NOT NULL,
                       FOREIGN KEY (uploaded_by) REFERENCES users(id),
                       FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE rating_history (
                                id UUID PRIMARY KEY,
                                player_id UUID NOT NULL,
                                old_rating INTEGER NOT NULL,
                                new_rating INTEGER NOT NULL,
                                rating_change INTEGER NOT NULL,
                                game_id UUID,
                                k_factor INTEGER NOT NULL,
                                changed_at TIMESTAMP NOT NULL,
                                FOREIGN KEY (player_id) REFERENCES users(id),
                                FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE audit_logs (
                            id UUID PRIMARY KEY,
                            action_type VARCHAR(50) NOT NULL,
                            user_id UUID,
                            details TEXT,
                            ip_address VARCHAR(50) NOT NULL,
                            timestamp TIMESTAMP NOT NULL,
                            FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_games_uploaded_by ON games(uploaded_by);
CREATE INDEX idx_rating_history_player ON rating_history(player_id);