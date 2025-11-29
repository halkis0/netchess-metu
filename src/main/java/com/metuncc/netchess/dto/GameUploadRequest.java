package com.metuncc.netchess.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class GameUploadRequest {

    @NotBlank(message = "PGN content is required")
    private String pgnContent;

    private UUID tournamentId;

    public String getPgnContent() {
        return pgnContent;
    }

    public void setPgnContent(String pgnContent) {
        this.pgnContent = pgnContent;
    }

    public UUID getTournamentId() {
        return tournamentId;
    }

    public void setTournamentId(UUID tournamentId) {
        this.tournamentId = tournamentId;
    }
}