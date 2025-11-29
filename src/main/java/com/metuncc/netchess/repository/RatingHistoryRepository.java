package com.metuncc.netchess.repository;

import com.metuncc.netchess.entity.RatingHistory;
import com.metuncc.netchess.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RatingHistoryRepository extends JpaRepository<RatingHistory, UUID> {
    List<RatingHistory> findByPlayerOrderByChangedAtDesc(User player);
    List<RatingHistory> findByGameId(UUID gameId);
}