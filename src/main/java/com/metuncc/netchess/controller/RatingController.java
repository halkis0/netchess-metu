package com.metuncc.netchess.controller;

import com.metuncc.netchess.entity.RatingHistory;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.exception.ResourceNotFoundException;
import com.metuncc.netchess.repository.RatingHistoryRepository;
import com.metuncc.netchess.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingHistoryRepository ratingHistoryRepository;
    private final UserRepository userRepository;

    public RatingController(RatingHistoryRepository ratingHistoryRepository,
                           UserRepository userRepository) {
        this.ratingHistoryRepository = ratingHistoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<RatingHistory>> getPlayerRatingHistory(@PathVariable UUID playerId) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));

        List<RatingHistory> history = ratingHistoryRepository.findByPlayerOrderByChangedAtDesc(player);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<RatingHistory>> getRatingChangesByGame(@PathVariable UUID gameId) {
        List<RatingHistory> history = ratingHistoryRepository.findByGameId(gameId);
        return ResponseEntity.ok(history);
    }
}