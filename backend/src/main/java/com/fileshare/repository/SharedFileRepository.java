package com.fileshare.repository;

import com.fileshare.model.SharedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedFileRepository extends JpaRepository<SharedFile, Long> {

    // Get all files shared WITH a specific user
    List<SharedFile> findBySharedWithUserId(Long userId);

    // Get all files shared BY a specific user (as owner)
    List<SharedFile> findByOwnerId(Long ownerId);

    // Check if a file is already shared with a user
    Optional<SharedFile> findByFileIdAndSharedWithUserId(Long fileId, Long sharedWithUserId);

    // Get sharing info for a specific file
    List<SharedFile> findByFileId(Long fileId);
    
 // ✅ NEW: Get all shares for a specific file by a specific owner
    List<SharedFile> findByFileIdAndOwnerId(Long fileId, Long ownerId);
}
