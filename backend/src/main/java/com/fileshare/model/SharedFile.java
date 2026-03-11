package com.fileshare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

// This tracks which files are shared with which users
@Entity
@Table(name = "shared_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SharedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which file is being shared
    @Column(name = "file_id", nullable = false)
    private Long fileId;

    // Who owns the file
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    // Who the file is shared with
    @Column(name = "shared_with_user_id", nullable = false)
    private Long sharedWithUserId;

    // Can be "VIEW" or "DOWNLOAD"
    @Column(name = "permission")
    private String permission = "VIEW";

    // When was this share created
    @Column(name = "shared_date")
    private LocalDateTime sharedDate;

    @PrePersist
    public void setSharedDate() {
        this.sharedDate = LocalDateTime.now();
    }
}
