package com.metuncc.netchess.service;

import com.metuncc.netchess.entity.Game;
import com.metuncc.netchess.entity.RatingHistory;
import com.metuncc.netchess.entity.User;
import com.metuncc.netchess.repository.RatingHistoryRepository;
import com.metuncc.netchess.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EloRatingService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    private final UserRepository userRepository;
    private final RatingHistoryRepository ratingHistoryRepository;
    private final AuditService auditService;

    public EloRatingService(UserRepository userRepository, RatingHistoryRepository ratingHistoryRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.ratingHistoryRepository = ratingHistoryRepository;
        this.auditService = auditService;
    }

    @Transactional
    public void updateRatings(User winner, User loser, Game game) {
        int kFactorWinner = getKFactor(winner);
        int kFactorLoser = getKFactor(loser);

        double expectedWinner = calculateExpectedScore(winner.getNccElo(), loser.getNccElo());
        double expectedLoser = 1 - expectedWinner;

        int newRatingWinner = calculateNewRating(winner.getNccElo(), kFactorWinner, 1.0, expectedWinner);
        int newRatingLoser = calculateNewRating(loser.getNccElo(), kFactorLoser, 0.0, expectedLoser);

        updatePlayerRating(winner, newRatingWinner, kFactorWinner, game);
        updatePlayerRating(loser, newRatingLoser, kFactorLoser, game);

        log.info("Ratings updated - Winner: {} ({} -> {}), Loser: {} ({} -> {})",
                winner.getUsername(), winner.getNccElo(), newRatingWinner,
                loser.getUsername(), loser.getNccElo(), newRatingLoser);
    }

    @Transactional
    public void updateRatingsForDraw(User player1, User player2, Game game) {
        int kFactor1 = getKFactor(player1);
        int kFactor2 = getKFactor(player2);

        double expected1 = calculateExpectedScore(player1.getNccElo(), player2.getNccElo());
        double expected2 = 1 - expected1;

        int newRating1 = calculateNewRating(player1.getNccElo(), kFactor1, 0.5, expected1);
        int newRating2 = calculateNewRating(player2.getNccElo(), kFactor2, 0.5, expected2);

        updatePlayerRating(player1, newRating1, kFactor1, game);
        updatePlayerRating(player2, newRating2, kFactor2, game);

        log.info("Draw ratings updated - Player1: {} ({} -> {}), Player2: {} ({} -> {})",
                player1.getUsername(), player1.getNccElo(), newRating1,
                player2.getUsername(), player2.getNccElo(), newRating2);
    }

    private int getKFactor(User player) {
        return player.getGamesPlayed() <= 30 ? 24 : 16;
    }

    private double calculateExpectedScore(int ratingPlayer, int ratingOpponent) {
        return 1.0 / (1.0 + Math.pow(10, (ratingOpponent - ratingPlayer) / 400.0));
    }

    private int calculateNewRating(int currentRating, int kFactor, double score, double expectedScore) {
        return (int) Math.round(currentRating + kFactor * (score - expectedScore));
    }

    private void updatePlayerRating(User player, int newRating, int kFactor, Game game) {
        int oldRating = player.getNccElo();
        int ratingChange = newRating - oldRating;

        RatingHistory history = new RatingHistory();
        history.setPlayer(player);
        history.setOldRating(oldRating);
        history.setNewRating(newRating);
        history.setRatingChange(ratingChange);
        history.setGame(game);
        history.setKFactor(kFactor);

        ratingHistoryRepository.save(history);

        player.setNccElo(newRating);
        player.setGamesPlayed(player.getGamesPlayed() + 1);
        userRepository.save(player);

        auditService.logRatingUpdate(player, oldRating, newRating);
    }
}