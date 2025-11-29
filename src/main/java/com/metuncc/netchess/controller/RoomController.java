package com.metuncc.netchess.controller;

import com.metuncc.netchess.dto.MessageResponse;
import com.metuncc.netchess.dto.RoomRequest;
import com.metuncc.netchess.entity.Room;
import com.metuncc.netchess.exception.ConflictException;
import com.metuncc.netchess.exception.ResourceNotFoundException;
import com.metuncc.netchess.repository.RoomRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Room>> getActiveRooms() {
        List<Room> rooms = roomRepository.findByActiveTrue();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        return ResponseEntity.ok(room);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> createRoom(@Valid @RequestBody RoomRequest request) {
        if (roomRepository.existsByName(request.getName())) {
            throw new ConflictException("Room with this name already exists");
        }

        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setName(request.getName());
        room.setLocation(request.getLocation());
        room.setCapacity(request.getCapacity());
        room.setActive(true);
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());

        roomRepository.save(room);

        return ResponseEntity.ok(room);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> updateRoom(@PathVariable UUID id,
                                       @Valid @RequestBody RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        room.setName(request.getName());
        room.setLocation(request.getLocation());
        room.setCapacity(request.getCapacity());
        room.setUpdatedAt(LocalDateTime.now());

        roomRepository.save(room);

        return ResponseEntity.ok(room);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRoom(@PathVariable UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        roomRepository.delete(room);

        return ResponseEntity.ok(new MessageResponse("Room deleted successfully"));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> deactivateRoom(@PathVariable UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        room.setActive(false);
        room.setUpdatedAt(LocalDateTime.now());

        roomRepository.save(room);

        return ResponseEntity.ok(new MessageResponse("Room deactivated successfully"));
    }
}