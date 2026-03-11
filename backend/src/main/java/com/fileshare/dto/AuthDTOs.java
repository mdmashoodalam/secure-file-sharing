package com.fileshare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// Register Request
public class AuthDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @Email(message = "Please enter a valid email")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @Email(message = "Please enter a valid email")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LoginResponse {
        private String token;
        private String email;
        private String name;
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareFileRequest {
        private Long fileId;

        @Email(message = "Please enter a valid email")
        @NotBlank(message = "Email is required")
        private String shareWithEmail;

        private String permission = "DOWNLOAD";
    }
}
