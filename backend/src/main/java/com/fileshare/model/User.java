package com.fileshare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

// This is our User table in MySQL
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @Email(message = "Please provide a valid email")
    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true)
    private String email;

    // Password will be stored encrypted (BCrypt)
    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    // Role can be ROLE_USER or ROLE_ADMIN
    @Column(nullable = false)
    private String role = "ROLE_USER";

    // Automatically set when user is created
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // This runs before saving to DB
    @PrePersist
    public void setCreatedAt() {
        this.createdAt = LocalDateTime.now();
    }
}
