package com.metuncc.netchess.repository;

import com.metuncc.netchess.entity.AuditLog;
import com.metuncc.netchess.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByUserOrderByTimestampDesc(User user);
    List<AuditLog> findByActionTypeOrderByTimestampDesc(AuditLog.ActionType actionType);
}