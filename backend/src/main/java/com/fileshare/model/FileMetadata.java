package com.fileshare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

// This stores info about uploaded files (not the actual file)
@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Original file name when uploaded
    @Column(name = "file_name", nullable = false)
    private String fileName;

    // MIME type like image/jpeg, application/pdf
    @Column(name = "file_type")
    private String fileType;

    // Size in bytes
    @Column(name = "file_size")
    private Long fileSize;

    // Where we saved it on the server: /uploads/uuid_filename.pdf
    @Column(name = "file_path", nullable = false)
    private String filePath;

    // Who uploaded this file (user id)
    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    // When the file was uploaded
    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    // Is the file deleted (soft delete)
    @Column(name = "is_deleted")
    private boolean deleted = false;

    @PrePersist
    public void setUploadDate() {
        this.uploadDate = LocalDateTime.now();
    }
}
