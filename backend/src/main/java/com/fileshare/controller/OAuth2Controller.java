package com.fileshare.controller;

import com.fileshare.dto.ApiResponse;
import com.fileshare.dto.AuthDTOs;
import com.fileshare.model.User;
import com.fileshare.repository.UserRepository;
import com.fileshare.security.CustomUserDetailsService;
import com.fileshare.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

// After Google redirects to frontend with ?email=xxx
// Frontend calls this endpoint to get a proper JWT token
@RestController
@RequestMapping("/api/auth")
public class OAuth2Controller {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtils jwtUtils;

    // Frontend calls this after Google OAuth2 success
    // GET /api/auth/oauth2/token?email=user@gmail.com
    @GetMapping("/oauth2/token")
    public ResponseEntity<ApiResponse<AuthDTOs.LoginResponse>> getOAuthToken(
            @RequestParam String email) {

        // Find the user in our database
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Load user details and generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String token = jwtUtils.generateToken(userDetails);

        AuthDTOs.LoginResponse loginResponse = new AuthDTOs.LoginResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole()
        );

        return ResponseEntity.ok(ApiResponse.success("OAuth2 login successful", loginResponse));
    }
}