package com.metuncc.netchess.controller;

import com.metuncc.netchess.dto.MessageResponse;
import com.metuncc.netchess.dto.RegisterRequest;
import com.metuncc.netchess.dto.UserResponse;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.exception.ResourceNotFoundException;
import com.metuncc.netchess.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserResponse(user));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> response = users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserResponse>> getLeaderboard(@RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<User> topPlayers = userRepository.findTopPlayersByRating(pageable);
        List<UserResponse> response = topPlayers.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserResponse(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Username already exists"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email already exists"));
        }

        if (userRepository.findByStudentNumber(request.getStudentNumber()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Student number already exists"));
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(request.getUsername());
        user.setStudentNumber(request.getStudentNumber());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        Set<User.Role> roles = new HashSet<>();
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                roles.add(User.Role.valueOf(request.getRole()));
            } catch (IllegalArgumentException e) {
                roles.add(User.Role.PLAYER);
            }
        } else {
            roles.add(User.Role.PLAYER);
        }
        user.setRoles(roles);

        user.setNccElo(1200);
        user.setGamesPlayed(0);
        user.setActive(true);

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (updates.containsKey("fullName")) {
            user.setFullName((String) updates.get("fullName"));
        }
        if (updates.containsKey("username")) {
            user.setUsername((String) updates.get("username"));
        }
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("studentNumber")) {
            user.setStudentNumber((String) updates.get("studentNumber"));
        }
        if (updates.containsKey("password") && !((String) updates.get("password")).isEmpty()) {
            user.setPassword(passwordEncoder.encode((String) updates.get("password")));
        }
        if (updates.containsKey("role")) {
            String roleStr = (String) updates.get("role");
            Set<User.Role> roles = new HashSet<>();
            try {
                roles.add(User.Role.valueOf(roleStr));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid role: " + roleStr));
            }
            user.setRoles(roles);
        }

        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        return ResponseEntity.ok(updated);
    }
}