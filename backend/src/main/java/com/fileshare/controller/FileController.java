package com.fileshare.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fileshare.dto.ApiResponse;
import com.fileshare.dto.AuthDTOs;
import com.fileshare.dto.FileShareInfoDTO;
import com.fileshare.dto.SharedFileDetailDTO;
import com.fileshare.model.FileMetadata;
import com.fileshare.model.SharedFile;
import com.fileshare.model.User;
import com.fileshare.repository.FileMetadataRepository;
import com.fileshare.repository.SharedFileRepository;
import com.fileshare.repository.UserRepository;
import com.fileshare.service.FileService;
import com.fileshare.service.SecureTokenService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    private SecureTokenService tokenService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private FileMetadataRepository fileRepo;

    // ✅ THIS WAS MISSING — needed by getContentDisposition()
    @Autowired
    private SharedFileRepository sharedFileRepo;

    // Get current logged-in user object
    private User getCurrentUser(Authentication auth) {
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Get current logged-in user's ID
    private Long getCurrentUserId(Authentication auth) {
        return getCurrentUser(auth).getId();
    }

    // Check if current user is admin
    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // POST /api/files/upload
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileMetadata>> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        Long userId = getCurrentUserId(auth);
        FileMetadata saved = fileService.uploadFile(file, userId);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", saved));
    }

    // GET /api/files/my-files
    @GetMapping("/my-files")
    public ResponseEntity<ApiResponse<List<FileMetadata>>> getMyFiles(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<FileMetadata> files = fileService.getMyFiles(userId);
        return ResponseEntity.ok(ApiResponse.success("Files retrieved", files));
    }

    // GET /api/files/info/{id}
    // Works for owner, VIEW and DOWNLOAD permission users
    @GetMapping("/info/{id}")
    public ResponseEntity<ApiResponse<FileMetadata>> getFileInfo(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = getCurrentUserId(auth);
        FileMetadata file = fileService.getFileInfo(id, userId);
        return ResponseEntity.ok(ApiResponse.success("File found", file));
    }

    // GET /api/files/all (admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FileMetadata>>> getAllFiles() {
        List<FileMetadata> files = fileService.getAllFiles();
        return ResponseEntity.ok(ApiResponse.success("All files retrieved", files));
    }

    // GET /api/files/download/{id}
    // Serves file for both preview (inline) and download (attachment)
    // VIEW permission → inline (browser opens it)
    // DOWNLOAD permission → attachment (browser saves it)
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            Authentication auth) throws MalformedURLException {

        Long userId = getCurrentUserId(auth);

        // getFileForDownload now allows both VIEW and DOWNLOAD permission
        FileMetadata file = fileService.getFileForDownload(id, userId);

        Path filePath = Paths.get(file.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found on server");
        }

        // Parse the correct MIME type stored at upload time
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(file.getFileType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        // Decide inline vs attachment based on user's permission
        String disposition = getContentDisposition(file, userId);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                // Expose header so frontend JS can read it
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition")
                .body(resource);
    }

    // Decide how to serve the file based on user's permission
    // inline = browser previews it (PDF viewer, image viewer)
    // attachment = browser downloads it to disk
    private String getContentDisposition(FileMetadata file, Long userId) {
        // Owner always gets inline
        if (file.getUploadedBy().equals(userId)) {
            return "inline; filename=\"" + file.getFileName() + "\"";
        }

        // Look up the share record to check permission
        Optional<SharedFile> share = sharedFileRepo
                .findByFileIdAndSharedWithUserId(file.getId(), userId);

        if (share.isPresent() && share.get().getPermission().equals("DOWNLOAD")) {
            // DOWNLOAD permission → force save to disk
            return "attachment; filename=\"" + file.getFileName() + "\"";
        }

        // VIEW permission → open inline in browser
        return "inline; filename=\"" + file.getFileName() + "\"";
    }

    // GET /api/files/download/public?token=xxx
    // Public temporary download link (no auth required)
    @GetMapping("/download/public")
    public ResponseEntity<Resource> downloadByToken(
            @RequestParam String token) throws MalformedURLException {
        FileMetadata file = tokenService.getFileByToken(token);
        Path filePath = Paths.get(file.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }

    // POST /api/files/share
    @PostMapping("/share")
    public ResponseEntity<ApiResponse<SharedFile>> shareFile(
            @Valid @RequestBody AuthDTOs.ShareFileRequest request,
            Authentication auth) {
        Long userId = getCurrentUserId(auth);
        SharedFile shared = fileService.shareFile(
                request.getFileId(), userId,
                request.getShareWithEmail(), request.getPermission());
        return ResponseEntity.ok(ApiResponse.success("File shared successfully", shared));
    }

    // GET /api/files/shared-with-me
    // Returns basic shared file records (just IDs and permission)
    @GetMapping("/shared-with-me")
    public ResponseEntity<ApiResponse<List<SharedFile>>> getSharedWithMe(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<SharedFile> files = fileService.getFilesSharedWithMe(userId);
        return ResponseEntity.ok(ApiResponse.success("Shared files retrieved", files));
    }

    // GET /api/files/shared-with-me/details
    // Returns enriched shared file list with real file name, size, type + owner name
    // This is what the Shared with Me page uses
    @GetMapping("/shared-with-me/details")
    public ResponseEntity<ApiResponse<List<SharedFileDetailDTO>>> getSharedWithMeDetails(
            Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<SharedFileDetailDTO> details = fileService.getSharedWithMeDetails(userId);
        return ResponseEntity.ok(ApiResponse.success("Shared file details retrieved", details));
    }

    // POST /api/files/generate-link/{fileId}
    // Generates a one-time temporary download URL
    @PostMapping("/generate-link/{fileId}")
    public ResponseEntity<ApiResponse<String>> generateLink(
            @PathVariable Long fileId,
            Authentication auth) {
        Long userId = getCurrentUserId(auth);
        String token = tokenService.generateDownloadToken(fileId, userId);
        String downloadUrl = "http://localhost:8080/api/files/download/public?token=" + token;
        return ResponseEntity.ok(ApiResponse.success("Download link generated", downloadUrl));
    }

    // DELETE /api/files/{id}
    // Soft deletes a file — only owner or admin can delete
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFile(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = getCurrentUserId(auth);
        boolean admin = isAdmin(auth);
        fileService.deleteFile(id, userId, admin);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully"));
    }
    

 // GET /api/files/{fileId}/shares
 // Owner can see who they shared a file with
 @GetMapping("/{fileId}/shares")
 public ResponseEntity<ApiResponse<List<FileShareInfoDTO>>> getSharesForFile(
         @PathVariable Long fileId,
         Authentication auth) {
     Long userId = getCurrentUserId(auth);
     List<FileShareInfoDTO> shares = fileService.getSharesForFile(fileId, userId);
     return ResponseEntity.ok(ApiResponse.success("Shares retrieved", shares));
 }

 // DELETE /api/files/share/{shareId}
 // Remove a share (stop sharing with someone)
 @DeleteMapping("/share/{shareId}")
 public ResponseEntity<ApiResponse<String>> removeShare(
         @PathVariable Long shareId,
         Authentication auth) {
     Long userId = getCurrentUserId(auth);
     fileService.removeShare(shareId, userId);
     return ResponseEntity.ok(ApiResponse.success("Share removed successfully"));
 }
}