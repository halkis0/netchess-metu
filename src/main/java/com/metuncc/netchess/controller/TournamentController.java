package com.metuncc.netchess.controller;

import com.metuncc.netchess.dto.MessageResponse;
import com.metuncc.netchess.dto.TournamentRequest;
import com.metuncc.netchess.entity.Room;
import com.metuncc.netchess.entity.Tournament;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.exception.ResourceNotFoundException;
import com.metuncc.netchess.repository.RoomRepository;
import com.metuncc.netchess.repository.TournamentRepository;
import com.metuncc.netchess.repository.UserRepository;
import com.metuncc.netchess.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentRepository tournamentRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public TournamentController(TournamentRepository tournamentRepository,
                               RoomRepository roomRepository,
                               UserRepository userRepository,
                               AuditService auditService) {
        this.tournamentRepository = tournamentRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments() {
        List<Tournament> tournaments = tournamentRepository.findAll();
        return ResponseEntity.ok(tournaments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> getTournamentById(@PathVariable UUID id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
        return ResponseEntity.ok(tournament);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> createTournament(@Valid @RequestBody TournamentRequest request,
                                             Authentication authentication,
                                             HttpServletRequest httpRequest) {
        String username = authentication.getName();
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Room room = null;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Start date must be before end date"));
        }

        Tournament tournament = new Tournament();
        tournament.setId(UUID.randomUUID());
        tournament.setName(request.getName());
        tournament.setDescription(request.getDescription());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setRoom(room);
        tournament.setMaxParticipants(request.getMaxParticipants());
        tournament.setCurrentParticipants(0);
        tournament.setStatus(Tournament.TournamentStatus.DRAFT);
        tournament.setOrganizer(organizer);
        tournament.setCreatedAt(LocalDateTime.now());
        tournament.setUpdatedAt(LocalDateTime.now());

        tournamentRepository.save(tournament);

        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        auditService.logTournamentCreated(organizer, tournament.getName(), ipAddress);

        return ResponseEntity.ok(tournament);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> updateTournament(@PathVariable UUID id,
                                             @Valid @RequestBody TournamentRequest request) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
            tournament.setRoom(room);
        }

        tournament.setName(request.getName());
        tournament.setDescription(request.getDescription());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setMaxParticipants(request.getMaxParticipants());
        tournament.setUpdatedAt(LocalDateTime.now());

        tournamentRepository.save(tournament);

        return ResponseEntity.ok(tournament);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTournament(@PathVariable UUID id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        tournamentRepository.delete(tournament);

        return ResponseEntity.ok(new MessageResponse("Tournament deleted successfully"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Tournament>> getTournamentsByStatus(@PathVariable String status) {
        Tournament.TournamentStatus tournamentStatus = Tournament.TournamentStatus.valueOf(status.toUpperCase());
        List<Tournament> tournaments = tournamentRepository.findByStatus(tournamentStatus);
        return ResponseEntity.ok(tournaments);
    }
}