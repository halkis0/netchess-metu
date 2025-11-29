package com.metuncc.netchess.repository;

import com.metuncc.netchess.entity.Tournament;
import com.metuncc.netchess.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, UUID> {
    
    @Query("SELECT t FROM Tournament t WHERE t.room = :room " +
           "AND t.status != 'CANCELLED' " +
           "AND ((t.startDate < :endDate AND t.endDate > :startDate))")
    List<Tournament> findConflictingTournaments(
        @Param("room") Room room,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    List<Tournament> findByStatus(Tournament.TournamentStatus status);
    List<Tournament> findByOrganizerId(UUID organizerId);
}