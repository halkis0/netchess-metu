package com.metuncc.netchess.service;

import com.metuncc.netchess.entity.AuditLog;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(AuditLog.ActionType actionType, User user, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActionType(actionType);
        auditLog.setUser(user);
        auditLog.setDetails(details);
        auditLog.setIpAddress(getClientIpAddress());
        
        auditLogRepository.save(auditLog);
    }

    public void logRatingUpdate(User player, int oldRating, int newRating) {
        String details = String.format("Rating changed from %d to %d (%+d)", 
                oldRating, newRating, newRating - oldRating);
        log(AuditLog.ActionType.RATING_UPDATE, player, details);
    }

    public void logMemberAdded(User admin, User newMember) {
        String details = String.format("Member %s added by %s", 
                newMember.getUsername(), admin.getUsername());
        log(AuditLog.ActionType.MEMBER_ADDED, admin, details);
    }

    public void logMemberRemoved(User admin, User removedMember) {
        String details = String.format("Member %s removed by %s", 
                removedMember.getUsername(), admin.getUsername());
        log(AuditLog.ActionType.MEMBER_REMOVED, admin, details);
    }

    public void logTournamentCreated(User organizer, String tournamentName, String ipAdress) {
        String details = String.format("Tournament '%s' created ['%s']", tournamentName, ipAdress);
        log(AuditLog.ActionType.TOURNAMENT_CREATED, organizer, details);
    }

    private String getClientIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return "UNKNOWN";
    }
}