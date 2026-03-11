package com.fileshare.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// This carries all the info the frontend needs
// for the Shared With Me page in one single object
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SharedFileDetailDTO {

    // Share record info
    private Long shareId;
    private String permission;         // VIEW or DOWNLOAD
    private LocalDateTime sharedDate;

    // File info
    private Long fileId;
    private String fileName;
    private String fileType;           // MIME type e.g. application/pdf
    private Long fileSize;

    // Owner info (who shared the file)
    private Long ownerId;
    private String ownerName;          // real name of the person who shared
    private String ownerEmail;
}