package com.fileshare.controller;

import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fileshare.dto.ApiResponse;
import com.fileshare.dto.AuthDTOs;
import com.fileshare.model.User;
import com.fileshare.repository.UserRepository;
import com.fileshare.service.AuthService;

import jakarta.validation.Valid;

// Handles login and registration API endpoints
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepo;

    // GET /api/auth/me
    // Returns current logged in user info
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDTOs.LoginResponse>> getCurrentUser(
            Authentication auth) {

        User user = userRepo.findByEmail(auth.name())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AuthDTOs.LoginResponse response = new AuthDTOs.LoginResponse(
                null, // don't send token back
                user.getEmail(),
                user.getName(),
                user.getRole()
        );

        return ResponseEntity.ok(ApiResponse.success("User info retrieved", response));
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody AuthDTOs.RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful! Welcome " + user.getName()));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTOs.LoginResponse>> login(@Valid @RequestBody AuthDTOs.LoginRequest request) {
        AuthDTOs.LoginResponse loginResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }
}
