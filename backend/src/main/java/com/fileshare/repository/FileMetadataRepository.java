package com.fileshare.repository;

import com.fileshare.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {

    // Get all files uploaded by a specific user
    List<FileMetadata> findByUploadedByAndDeletedFalse(Long userId);

    // Get all files that are not deleted (for admin)
    List<FileMetadata> findByDeletedFalse();

    // Find a specific file that belongs to a user
    Optional<FileMetadata> findByIdAndUploadedByAndDeletedFalse(Long id, Long userId);
}
