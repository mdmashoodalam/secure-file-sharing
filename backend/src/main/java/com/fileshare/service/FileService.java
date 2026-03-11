package com.fileshare.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fileshare.dto.FileShareInfoDTO;
import com.fileshare.dto.SharedFileDetailDTO;
import com.fileshare.model.FileMetadata;
import com.fileshare.model.SharedFile;
import com.fileshare.model.User;
import com.fileshare.repository.FileMetadataRepository;
import com.fileshare.repository.SharedFileRepository;
import com.fileshare.repository.UserRepository;

@Service
public class FileService {

    private static final Logger logger = LoggerFactory.getLogger(FileService.class);

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.allowed.file.types}")
    private String allowedFileTypes;

    @Autowired
    private FileMetadataRepository fileRepo;

    @Autowired
    private SharedFileRepository sharedFileRepo;

    @Autowired
    private UserRepository userRepo;

    // Upload a file
    public FileMetadata uploadFile(MultipartFile file, Long userId) throws IOException {
        validateFile(file);

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        FileMetadata metadata = new FileMetadata();
        metadata.setFileName(file.getOriginalFilename());
        metadata.setFileType(file.getContentType());
        metadata.setFileSize(file.getSize());
        metadata.setFilePath(filePath.toString());
        metadata.setUploadedBy(userId);

        FileMetadata saved = fileRepo.save(metadata);
        logger.info("File uploaded: {} by user {}", uniqueFileName, userId);
        return saved;
    }

    // Get all files uploaded by a user
    public List<FileMetadata> getMyFiles(Long userId) {
        return fileRepo.findByUploadedByAndDeletedFalse(userId);
    }

    // Get all files (admin)
    public List<FileMetadata> getAllFiles() {
        return fileRepo.findByDeletedFalse();
    }

    // Get file info - works for owner AND any shared user (VIEW or DOWNLOAD)
    // Used to show file name/size/type in the shared files page
    public FileMetadata getFileInfo(Long fileId, Long userId) {
        FileMetadata file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));

        if (file.isDeleted()) {
            throw new RuntimeException("File has been deleted");
        }

        // Owner can always access info
        if (file.getUploadedBy().equals(userId)) {
            return file;
        }

        // Any shared user (VIEW or DOWNLOAD) can get info
        boolean isShared = sharedFileRepo
                .findByFileIdAndSharedWithUserId(fileId, userId)
                .isPresent();

        if (!isShared) {
            throw new RuntimeException("Access denied");
        }

        return file;
    }

 // Get file for reading - works for owner, VIEW permission, and DOWNLOAD permission
 // The permission difference is handled at the controller level
 public FileMetadata getFileForDownload(Long fileId, Long userId) {
     FileMetadata file = fileRepo.findById(fileId)
             .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));

     if (file.isDeleted()) {
         throw new RuntimeException("File has been deleted");
     }

     // Owner can always access
     if (file.getUploadedBy().equals(userId)) {
         return file;
     }

     // Check if file is shared with this user (any permission - VIEW or DOWNLOAD)
     Optional<SharedFile> share = sharedFileRepo
             .findByFileIdAndSharedWithUserId(fileId, userId);

     if (share.isEmpty()) {
         throw new RuntimeException("Access denied - file not shared with you");
     }

     // Both VIEW and DOWNLOAD can read the file
     // VIEW = inline preview only, DOWNLOAD = can save it
     // We allow both here — the Content-Disposition header controls the behavior
     return file;
 }

    // Share a file with another user
    public SharedFile shareFile(Long fileId, Long ownerId, String shareWithEmail, String permission) {
        FileMetadata file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUploadedBy().equals(ownerId)) {
            throw new RuntimeException("You can only share your own files");
        }

        User shareWithUser = userRepo.findByEmail(shareWithEmail)
                .orElseThrow(() -> new RuntimeException("No user found with email: " + shareWithEmail));

        if (shareWithUser.getId().equals(ownerId)) {
            throw new RuntimeException("You cannot share a file with yourself");
        }

        if (sharedFileRepo.findByFileIdAndSharedWithUserId(fileId, shareWithUser.getId()).isPresent()) {
            throw new RuntimeException("File already shared with this user");
        }

        SharedFile sharedFile = new SharedFile();
        sharedFile.setFileId(fileId);
        sharedFile.setOwnerId(ownerId);
        sharedFile.setSharedWithUserId(shareWithUser.getId());
        sharedFile.setPermission(permission != null ? permission : "VIEW");

        SharedFile saved = sharedFileRepo.save(sharedFile);
        logger.info("File {} shared by user {} with {}", fileId, ownerId, shareWithUser.getId());
        return saved;
    }

    // Get all files shared with a user
    public List<SharedFile> getFilesSharedWithMe(Long userId) {
        return sharedFileRepo.findBySharedWithUserId(userId);
    }

    // Delete a file (soft delete)
    public void deleteFile(Long fileId, Long userId, boolean isAdmin) {
        FileMetadata file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!isAdmin && !file.getUploadedBy().equals(userId)) {
            throw new RuntimeException("Access denied - you can only delete your own files");
        }

        file.setDeleted(true);
        fileRepo.save(file);
        logger.info("File {} deleted by user {}", fileId, userId);
    }

    // Validate file before saving
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot upload an empty file");
        }
        List<String> allowed = Arrays.asList(allowedFileTypes.split(","));
        if (!allowed.contains(file.getContentType())) {
            throw new RuntimeException("File type not allowed: " + file.getContentType());
        }
    }
    
 // Returns enriched shared file list with real file name + owner name
 // Add this import at the top of FileService.java:
 // import com.fileshare.dto.SharedFileDetailDTO;

 public List<SharedFileDetailDTO> getSharedWithMeDetails(Long userId) {
     List<SharedFile> shares = sharedFileRepo.findBySharedWithUserId(userId);

     List<SharedFileDetailDTO> result = new ArrayList<>();

     for (SharedFile share : shares) {
         SharedFileDetailDTO dto = new SharedFileDetailDTO();
         dto.setShareId(share.getId());
         dto.setPermission(share.getPermission());
         dto.setSharedDate(share.getSharedDate());
         dto.setFileId(share.getFileId());

         // Get file details
         fileRepo.findById(share.getFileId()).ifPresent(file -> {
             dto.setFileName(file.getFileName());
             dto.setFileType(file.getFileType());
             dto.setFileSize(file.getFileSize());
         });

         // Get owner name
         userRepo.findById(share.getOwnerId()).ifPresent(owner -> {
             dto.setOwnerId(owner.getId());
             dto.setOwnerName(owner.getName());
             dto.setOwnerEmail(owner.getEmail());
         });

         result.add(dto);
     }

     return result;
 }
 
//Get list of people a file is shared with (for the owner to see)
public List<FileShareInfoDTO> getSharesForFile(Long fileId, Long ownerId) {
  // Make sure this user owns the file
  FileMetadata file = fileRepo.findById(fileId)
          .orElseThrow(() -> new RuntimeException("File not found"));

  if (!file.getUploadedBy().equals(ownerId)) {
      throw new RuntimeException("Access denied");
  }

  List<SharedFile> shares = sharedFileRepo.findByFileIdAndOwnerId(fileId, ownerId);
  List<FileShareInfoDTO> result = new ArrayList<>();

  for (SharedFile share : shares) {
      FileShareInfoDTO dto = new FileShareInfoDTO();
      dto.setShareId(share.getId());
      dto.setFileId(share.getFileId());
      dto.setPermission(share.getPermission());
      dto.setSharedDate(share.getSharedDate());

      // Get the name + email of who it's shared with
      userRepo.findById(share.getSharedWithUserId()).ifPresent(user -> {
          dto.setSharedWithName(user.getName());
          dto.setSharedWithEmail(user.getEmail());
      });

      result.add(dto);
  }

  return result;
}
 

//Remove a share record (unshare a file)
public void removeShare(Long shareId, Long userId) {
 SharedFile share = sharedFileRepo.findById(shareId)
         .orElseThrow(() -> new RuntimeException("Share not found"));

 // Only the owner can remove a share
 if (!share.getOwnerId().equals(userId)) {
     throw new RuntimeException("Access denied - only the owner can remove shares");
 }

 sharedFileRepo.deleteById(shareId);
 logger.info("Share {} removed by user {}", shareId, userId);
}
 
}