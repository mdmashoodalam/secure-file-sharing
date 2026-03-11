package com.fileshare.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Carries info about who a file is shared with
// Used in the "Shared By Me" section on My Files page
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileShareInfoDTO {
    private Long shareId;
    private Long fileId;
    private String sharedWithName;   // name of the person you shared with
    private String sharedWithEmail;  // their email
    private String permission;       // VIEW or DOWNLOAD
    private LocalDateTime sharedDate;
}