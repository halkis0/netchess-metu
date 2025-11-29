package com.metuncc.netchess.controller;

import com.metuncc.netchess.entity.AuditLog;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.exception.ResourceNotFoundException;
import com.metuncc.netchess.repository.AuditLogRepository;
import com.metuncc.netchess.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditController(AuditLogRepository auditLogRepository,
                          UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAll();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getAuditLogsByUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<AuditLog> logs = auditLogRepository.findByUserOrderByTimestampDesc(user);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/action/{actionType}")
    public ResponseEntity<List<AuditLog>> getAuditLogsByAction(@PathVariable String actionType) {
        AuditLog.ActionType action = AuditLog.ActionType.valueOf(actionType.toUpperCase());
        List<AuditLog> logs = auditLogRepository.findByActionTypeOrderByTimestampDesc(action);
        return ResponseEntity.ok(logs);
    }
}