package com.metuncc.netchess.repository;

import com.metuncc.netchess.entity.Game;
import com.metuncc.netchess.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<Game, UUID> {
    List<Game> findByUploadedBy(User user);
    List<Game> findByApprovedTrue();
    List<Game> findByApprovedFalse();
    List<Game> findByTournamentId(UUID tournamentId);
}