package com.metuncc.netchess.repository;

import com.metuncc.netchess.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
    List<Post> findAllByOrderByPinnedDescCreatedAtDesc();
}