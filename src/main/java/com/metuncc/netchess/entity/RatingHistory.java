package com.metuncc.netchess.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rating_history")
@NoArgsConstructor
@AllArgsConstructor
public class RatingHistory {

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    @Column(nullable = false)
    private Integer oldRating;

    @Column(nullable = false)
    private Integer newRating;

    @Column(nullable = false)
    private Integer ratingChange;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;

    @Column(nullable = false)
    private Integer kFactor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime changedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getPlayer() {
        return player;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public Integer getOldRating() {
        return oldRating;
    }

    public void setOldRating(Integer oldRating) {
        this.oldRating = oldRating;
    }

    public Integer getNewRating() {
        return newRating;
    }

    public void setNewRating(Integer newRating) {
        this.newRating = newRating;
    }

    public Integer getRatingChange() {
        return ratingChange;
    }

    public void setRatingChange(Integer ratingChange) {
        this.ratingChange = ratingChange;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public Integer getkFactor() {
        return kFactor;
    }

    public void setkFactor(Integer kFactor) {
        this.kFactor = kFactor;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}