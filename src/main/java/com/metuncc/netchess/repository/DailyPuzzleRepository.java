package com.metuncc.netchess.repository;

import com.metuncc.netchess.entity.DailyPuzzle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyPuzzleRepository extends JpaRepository<DailyPuzzle, UUID> {
    Optional<DailyPuzzle> findByPuzzleDate(LocalDate date);
}