import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import { authService } from '../services/auth';
import ChessNotation from '../components/ChessNotation';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newComment, setNewComment] = useState('');

    const user = authService.getUser();
    const canModerate = user && (user.roles.includes('ORGANIZER') || user.roles.includes('ADMIN'));

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await postAPI.getById(id);
            setPost(response.data);
        } catch (err) {
            setError('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await postAPI.getComments(id);
            setComments(response.data);
        } catch (err) {
            console.error('Failed to load comments');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (post.locked) {
            setError('This post is locked');
            return;
        }

        try {
            await postAPI.addComment(id, { content: newComment });
            setSuccess('Comment added!');
            setNewComment('');
            fetchComments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await postAPI.deleteComment(id, commentId);
            setSuccess('Comment deleted');
            fetchComments();
        } catch (err) {
            setError('Failed to delete comment');
        }
    };

    const handleToggleLock = async () => {
        try {
            await postAPI.toggleLock(id);
            fetchPost();
        } catch (err) {
            setError('Failed to toggle lock');
        }
    };

    if (loading) return <div className="container"><div className="loading">Loading...</div></div>;
    if (!post) return <div className="container"><div className="alert alert-error">Post not found</div></div>;

    return (
        <div className="container">
            <button onClick={() => navigate('/forum')} className="btn btn-secondary" style={{marginBottom: '1rem'}}>
                ← Back to Forum
            </button>

            <div className="card">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div style={{borderBottom: '2px solid var(--light-gray)', paddingBottom: '1.5rem', marginBottom: '1.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                        {post.pinned && <span className="badge badge-admin">PINNED</span>}
                        {post.locked && <span className="badge badge-organizer">LOCKED</span>}
                    </div>
                    <h2 className="card-title" style={{marginBottom: '0.5rem'}}>{post.title}</h2>
                    <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '1rem'}}>
                        Posted by <strong>{post.author?.fullName || 'Unknown'}</strong> • {new Date(post.createdAt).toLocaleString()}
                        {post.updatedAt !== post.createdAt && <span> (edited)</span>}
                    </div>

                    <div style={{fontSize: '1rem', lineHeight: '1.6', color: 'var(--dark-gray)'}}>
                        <ChessNotation content={post.content} />
                    </div>

                    {canModerate && (
                        <div style={{marginTop: '1.5rem', display: 'flex', gap: '0.5rem'}}>
                            <button onClick={handleToggleLock} className="btn btn-secondary">
                                {post.locked ? 'Unlock' : 'Lock'} Post
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <h3 style={{fontSize: '1.25rem', marginBottom: '1rem'}}>
                        Comments ({comments.length})
                    </h3>

                    {!post.locked && (
                        <form onSubmit={handleAddComment} style={{marginBottom: '2rem'}}>
                            <div className="form-group">
                                <label className="form-label">Add a comment (supports PGN and FEN)</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    required
                                    placeholder="Share your thoughts...&#10;&#10;Tip: Use [pgn]...[/pgn] or [fen]...[/fen]"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Post Comment</button>
                        </form>
                    )}

                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        {comments.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '2rem', color: 'var(--gray)'}}>
                                No comments yet. Be the first to comment!
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div
                                    key={comment.id}
                                    style={{
                                        background: 'var(--off-white)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--light-gray)'
                                    }}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                        <div style={{flex: 1}}>
                                            <div style={{fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.5rem'}}>
                                                <strong>{comment.author?.fullName || 'Unknown'}</strong> • {new Date(comment.createdAt).toLocaleString()}
                                            </div>
                                            <div style={{fontSize: '0.95rem', lineHeight: '1.5'}}>
                                                <ChessNotation content={comment.content} />
                                            </div>
                                        </div>
                                        {(user?.id === comment.author?.id || canModerate) && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="btn btn-danger"
                                                style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginLeft: '1rem'}}>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;