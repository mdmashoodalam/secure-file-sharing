package com.fileshare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

// This is used for temporary download links
// Example: /download?token=abc123 (expires after 1 hour)
@Entity
@Table(name = "secure_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecureToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The random token string
    @Column(nullable = false, unique = true)
    private String token;

    // Which file this token is for
    @Column(name = "file_id", nullable = false)
    private Long fileId;

    // Who created this token
    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    // When does this token expire
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Was this token already used
    @Column(name = "is_used")
    private boolean used = false;

    // When was it created
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void setCreatedAt() {
        this.createdAt = LocalDateTime.now();
    }

    // Helper method to check if token is expired
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
}
