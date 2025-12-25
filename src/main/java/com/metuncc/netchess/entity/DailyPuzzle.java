package com.metuncc.netchess.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_puzzles")
@NoArgsConstructor
@AllArgsConstructor
public class DailyPuzzle {
    
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(name = "puzzle_date", nullable = false, unique = true)
    private LocalDate puzzleDate;
    
    @Column(name = "fen_position", nullable = false, length = 100)
    private String fenPosition;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String solution;
    
    @Column(name = "moves_count", nullable = false)
    private Integer movesCount = 1;
    
    @Column(columnDefinition = "TEXT")
    private String hint;
    
    @Column(length = 20)
    private String difficulty;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    public void setUUID(UUID id) { this.id = id; }

    public UUID getUUID() { return id; }

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public void setPuzzleDate(LocalDate date) { this.puzzleDate = date; }

    public LocalDate getPuzzleDate() { return puzzleDate; }

    public void setFenPosition(String fenPosition) { this.fenPosition = fenPosition; }

    public String getFenPosition() { return fenPosition; }

    public void setSolution(String solution) { this.solution = solution; }

    public String getSolution() { return solution; }

    public void setMovesCount(Integer movesCount) { this.movesCount = movesCount; }

    public Integer getMovesCount() { return movesCount; }

    public void setHint(String hint) { this.hint = hint; }

    public String getHint() { return hint; }

    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getDifficulty() { return difficulty; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public User getCreatedBy() { return createdBy; }

}