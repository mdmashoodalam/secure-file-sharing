package com.fileshare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// DTO = Data Transfer Object
// These classes carry data between frontend and backend

// Used for register request
@Data
class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Please enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}

// Used for login request
@Data
class LoginRequest {
    @Email(message = "Please enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}

// Sent back after successful login
@Data
class LoginResponse {
    private String token;
    private String email;
    private String name;
    private String role;

    public LoginResponse(String token, String email, String name, String role) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}

// Used when sharing a file
@Data
class ShareFileRequest {
    @NotBlank(message = "File ID is required")
    private Long fileId;

    @Email(message = "Please enter a valid email")
    @NotBlank(message = "Email is required")
    private String shareWithEmail;

    private String permission = "VIEW"; // VIEW or DOWNLOAD
}
