package com.metuncc.netchess.controller;

import com.metuncc.netchess.dto.GameUploadRequest;
import com.metuncc.netchess.dto.MessageResponse;
import com.metuncc.netchess.entity.Game;
import com.metuncc.netchess.entity.Tournament;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.exception.ResourceNotFoundException;
import com.metuncc.netchess.repository.GameRepository;
import com.metuncc.netchess.repository.TournamentRepository;
import com.metuncc.netchess.repository.UserRepository;
import com.metuncc.netchess.service.StorageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;
    private final StorageService storageService;

    public GameController(GameRepository gameRepository,
                         UserRepository userRepository,
                         TournamentRepository tournamentRepository,
                         StorageService storageService) {
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.tournamentRepository = tournamentRepository;
        this.storageService = storageService;
    }

    @GetMapping
    public ResponseEntity<List<Game>> getAllGames() {
        List<Game> games = gameRepository.findAll();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Game>> getApprovedGames() {
        List<Game> games = gameRepository.findByApprovedTrue();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<Game>> getPendingGames() {
        List<Game> games = gameRepository.findByApprovedFalse();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Game> getGameById(@PathVariable UUID id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        return ResponseEntity.ok(game);
    }

    @PostMapping
    public ResponseEntity<?> uploadGame(@Valid @RequestBody GameUploadRequest request,
                                       Authentication authentication) {
        String username = authentication.getName();
        User uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Tournament tournament = null;
        if (request.getTournamentId() != null) {
            tournament = tournamentRepository.findById(request.getTournamentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        }

        Game game = new Game();
        game.setId(UUID.randomUUID());
        game.setPgnContent(request.getPgnContent());
        game.setUploadedBy(uploader);
        game.setTournament(tournament);
        game.setApproved(false);
        game.setCreatedAt(LocalDateTime.now());

        gameRepository.save(game);

        return ResponseEntity.ok(game);
    }

    @PostMapping("/upload-file")
    public ResponseEntity<?> uploadGameFile(@RequestParam("file") MultipartFile file,
                                           @RequestParam(required = false) UUID tournamentId,
                                           Authentication authentication) {
        String username = authentication.getName();
        User uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Tournament tournament = null;
        if (tournamentId != null) {
            tournament = tournamentRepository.findById(tournamentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        }

        String s3Key = storageService.uploadFile(file);

        Game game = new Game();
        game.setId(UUID.randomUUID());
        game.setS3Key(s3Key);
        game.setUploadedBy(uploader);
        game.setTournament(tournament);
        game.setApproved(false);
        game.setCreatedAt(LocalDateTime.now());

        gameRepository.save(game);

        return ResponseEntity.ok(game);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> approveGame(@PathVariable UUID id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        game.setApproved(true);
        gameRepository.save(game);

        return ResponseEntity.ok(new MessageResponse("Game approved successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> deleteGame(@PathVariable UUID id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        if (game.getS3Key() != null) {
            storageService.deleteFile(game.getS3Key());
        }

        gameRepository.delete(game);

        return ResponseEntity.ok(new MessageResponse("Game deleted successfully"));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<Game>> getGamesByTournament(@PathVariable UUID tournamentId) {
        List<Game> games = gameRepository.findByTournamentId(tournamentId);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/my-games")
    public ResponseEntity<List<Game>> getMyGames(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Game> games = gameRepository.findByUploadedBy(user);
        return ResponseEntity.ok(games);
    }
}