package com.metuncc.netchess.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoomRequest {

    @NotBlank(message = "Room name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 255)
    private String location;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}