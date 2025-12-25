import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import { authService } from '../services/auth';

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });

    const user = authService.getUser();
    const canModerate = user && (user.roles.includes('ORGANIZER') || user.roles.includes('ADMIN'));
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await postAPI.getAll();
            setPosts(response.data);
        } catch (err) {
            setError('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await postAPI.create(newPost);
            setSuccess('Post created successfully!');
            setShowCreate(false);
            setNewPost({ title: '', content: '' });
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post');
        }
    };

    const handleTogglePin = async (postId) => {
        try {
            await postAPI.togglePin(postId);
            fetchPosts();
        } catch (err) {
            setError('Failed to toggle pin');
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await postAPI.delete(postId);
            setSuccess('Post deleted');
            fetchPosts();
        } catch (err) {
            setError('Failed to delete post');
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

    return (
        <div className="container">
            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                    <h2 className="card-title">Discussion Forum</h2>
                    <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
                        {showCreate ? 'Cancel' : '+ New Post'}
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {showCreate && (
                    <div style={{background: 'var(--off-white)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem'}}>
                        <h3 style={{marginBottom: '1.5rem'}}>Create New Post</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                    required
                                    placeholder="What's on your mind?"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Content (supports PGN and FEN)</label>
                                <textarea
                                    className="form-control"
                                    rows="8"
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                    required
                                    placeholder="Share your thoughts, games, or positions...&#10;&#10;Tip: Wrap PGN in [pgn]...[/pgn] or FEN in [fen]...[/fen]"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Post</button>
                        </form>
                    </div>
                )}

                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {posts.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '3rem', color: 'var(--gray)'}}>
                            No posts yet. Be the first to start a discussion!
                        </div>
                    ) : (
                        posts.map(post => (
                            <div
                                key={post.id}
                                style={{
                                    border: '1px solid var(--light-gray)',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    borderLeft: post.pinned ? '4px solid var(--primary-red)' : '1px solid var(--light-gray)'
                                }}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                    <div style={{flex: 1}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                                            {post.pinned && <span className="badge badge-admin">PINNED</span>}
                                            {post.locked && <span className="badge badge-organizer">LOCKED</span>}
                                            <h3
                                                style={{fontSize: '1.25rem', fontWeight: '600', margin: 0, cursor: 'pointer'}}
                                                onClick={() => navigate(`/forum/${post.id}`)}>
                                                {post.title}
                                            </h3>
                                        </div>
                                        <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '1rem'}}>
                                            by <strong>{post.author?.fullName || 'Unknown'}</strong> • {new Date(post.createdAt).toLocaleString()}
                                        </div>
                                        <p style={{
                                            color: 'var(--dark-gray)',
                                            marginBottom: '1rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {post.content}
                                        </p>
                                        <Link
                                            to={`/forum/${post.id}`}
                                            style={{color: 'var(--primary-red)', textDecoration: 'none', fontWeight: 500}}>
                                            Read more →
                                        </Link>
                                    </div>
                                    {canModerate && (
                                        <div style={{display: 'flex', gap: '0.5rem', marginLeft: '1rem'}}>
                                            <button
                                                onClick={() => handleTogglePin(post.id)}
                                                className="btn btn-secondary"
                                                style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                                                {post.pinned ? 'Unpin' : 'Pin'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="btn btn-danger"
                                                style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forum;