package com.fileshare.service;

import com.fileshare.model.FileMetadata;
import com.fileshare.model.SecureToken;
import com.fileshare.repository.FileMetadataRepository;
import com.fileshare.repository.SecureTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

// Handles temporary secure download link generation
// Token expires after configured time (default 1 hour)
@Service
public class SecureTokenService {

    private static final Logger logger = LoggerFactory.getLogger(SecureTokenService.class);

    @Value("${app.secure.token.expiry}")
    private long tokenExpiryMs;

    @Autowired
    private SecureTokenRepository tokenRepo;

    @Autowired
    private FileMetadataRepository fileRepo;

    // Generate a temporary download token for a file
    public String generateDownloadToken(Long fileId, Long userId) {
        // Make sure file exists and user owns it
        FileMetadata file = fileRepo.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only generate links for your own files");
        }

        // Create a random token
        String tokenValue = UUID.randomUUID().toString().replace("-", "");

        // Calculate expiry time
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(tokenExpiryMs / 1000);

        // Save token to database
        SecureToken token = new SecureToken();
        token.setToken(tokenValue);
        token.setFileId(fileId);
        token.setCreatedBy(userId);
        token.setExpiresAt(expiresAt);

        tokenRepo.save(token);
        logger.info("Generated secure token for file {} by user {}", fileId, userId);

        return tokenValue;
    }

    // Validate token and return the associated file
    public FileMetadata getFileByToken(String tokenValue) {
        // Find token in database
        SecureToken token = tokenRepo.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // Check if already used
        if (token.isUsed()) {
            throw new RuntimeException("This download link has already been used");
        }

        // Check if expired
        if (token.isExpired()) {
            throw new RuntimeException("This download link has expired");
        }

        // Mark token as used (one-time use)
        token.setUsed(true);
        tokenRepo.save(token);

        // Return the file
        return fileRepo.findById(token.getFileId())
                .orElseThrow(() -> new RuntimeException("File not found"));
    }
}
