package com.metuncc.netchess.dto;

import com.metuncc.netchess.entity.User;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private Set<User.Role> roles;
    private Integer nccElo;
    private Integer gamesPlayed;
    private LocalDateTime createdAt;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.roles = user.getRoles();
        this.nccElo = user.getNccElo();
        this.gamesPlayed = user.getGamesPlayed();
        this.createdAt = user.getCreatedAt();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Set<User.Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<User.Role> roles) {
        this.roles = roles;
    }

    public Integer getNccElo() {
        return nccElo;
    }

    public void setNccElo(Integer nccElo) {
        this.nccElo = nccElo;
    }

    public Integer getGamesPlayed() {
        return gamesPlayed;
    }

    public void setGamesPlayed(Integer gamesPlayed) {
        this.gamesPlayed = gamesPlayed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}