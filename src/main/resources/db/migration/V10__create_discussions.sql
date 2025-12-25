CREATE TABLE posts (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       title VARCHAR(255) NOT NULL,
                       content TEXT NOT NULL,
                       author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       pinned BOOLEAN DEFAULT FALSE,
                       locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE comments (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                          content TEXT NOT NULL,
                          author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);