package com.metuncc.netchess.controller;

import com.metuncc.netchess.entity.DailyPuzzle;
import com.metuncc.netchess.exception.ResourceNotFoundException;
import com.metuncc.netchess.repository.DailyPuzzleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/puzzles")
public class PuzzleController {

    private final DailyPuzzleRepository puzzleRepository;

    public PuzzleController(DailyPuzzleRepository puzzleRepository) {
        this.puzzleRepository = puzzleRepository;
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyPuzzle> getTodaysPuzzle() {
        return puzzleRepository.findByPuzzleDate(LocalDate.now())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<DailyPuzzle> createPuzzle(@RequestBody DailyPuzzle puzzle) {
        puzzle.setCreatedAt(java.time.LocalDateTime.now());
        DailyPuzzle saved = puzzleRepository.save(puzzle);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<DailyPuzzle>> getAllPuzzles() {
        List<DailyPuzzle> puzzles = puzzleRepository.findAll();
        return ResponseEntity.ok(puzzles);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<DailyPuzzle> updatePuzzle(@PathVariable UUID id, @RequestBody DailyPuzzle puzzle) {
        DailyPuzzle existing = puzzleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Puzzle not found"));

        existing.setPuzzleDate();
        existing.setFenPosition(puzzle.getFenPosition());
        existing.setSolution(puzzle.getSolution());
        existing.setMovesCount(puzzle.getMovesCount());
        existing.setHint(puzzle.getHint());
        existing.setDifficulty(puzzle.getDifficulty());

        DailyPuzzle updated = puzzleRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> deletePuzzle(@PathVariable UUID id) {
        puzzleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Puzzle deleted successfully"));
    }
}