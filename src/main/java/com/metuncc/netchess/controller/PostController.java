package com.metuncc.netchess.controller;

import com.metuncc.netchess.entity.Comment;
import com.metuncc.netchess.entity.Post;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.repository.CommentRepository;
import com.metuncc.netchess.repository.PostRepository;
import com.metuncc.netchess.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    
    public PostController(PostRepository postRepository, CommentRepository commentRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByPinnedDescCreatedAtDesc();
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable UUID id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Map<String, String> request, Authentication auth) {
        String username = auth.getName();
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = new Post();
        post.setTitle(request.get("title"));
        post.setContent(request.get("content"));
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        
        Post saved = postRepository.save(post);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable UUID id, @RequestBody Map<String, String> request, Authentication auth) {
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getAuthor().getUsername().equals(auth.getName())) {
                        throw new RuntimeException("Unauthorized");
                    }
                    post.setTitle(request.get("title"));
                    post.setContent(request.get("content"));
                    post.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<?> deletePost(@PathVariable UUID id) {
        postRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Post deleted"));
    }
    
    @PatchMapping("/{id}/pin")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Post> togglePin(@PathVariable UUID id) {
        return postRepository.findById(id)
                .map(post -> {
                    post.setPinned(!post.getPinned());
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Post> toggleLock(@PathVariable UUID id) {
        return postRepository.findById(id)
                .map(post -> {
                    post.setLocked(!post.getLocked());
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Comments
    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable UUID postId) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable UUID postId, @RequestBody Map<String, String> request, Authentication auth) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (post.getLocked()) {
            throw new RuntimeException("Post is locked");
        }
        
        User author = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setContent(request.get("content"));
        comment.setAuthor(author);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }
    
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable UUID postId, @PathVariable UUID commentId, Authentication auth) {
        return commentRepository.findById(commentId)
                .map(comment -> {
                    User user = userRepository.findByUsername(auth.getName()).orElseThrow();
                    boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
                    boolean isAdmin = user.getRoles().stream()
                            .anyMatch(role -> role.name().equals("ADMIN") || role.name().equals("ORGANIZER"));
                    
                    if (!isAuthor && !isAdmin) {
                        throw new RuntimeException("Unauthorized");
                    }
                    
                    commentRepository.delete(comment);
                    return ResponseEntity.ok(Map.of("message", "Comment deleted"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}