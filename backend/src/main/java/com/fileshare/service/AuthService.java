package com.fileshare.service;

import com.fileshare.dto.AuthDTOs;
import com.fileshare.model.User;
import com.fileshare.repository.UserRepository;
import com.fileshare.utils.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Handles user registration and login logic
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    // Register a new user
    public User register(AuthDTOs.RegisterRequest request) {
        // Check if email already taken
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        // Create new user object
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encrypt password before saving to DB
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");

        // Save to database
        User savedUser = userRepository.save(user);
        logger.info("New user registered: {}", savedUser.getEmail());

        return savedUser;
    }

    // Login user and return JWT token
    public AuthDTOs.LoginResponse login(AuthDTOs.LoginRequest request) {
        // This will throw exception if credentials are wrong
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Get user details from authentication object
        UserDetails userDetails = (UserDetails) auth.getPrincipal();

        // Generate JWT token
        String token = jwtUtils.generateToken(userDetails);

        // Get full user info from database to return name and role
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        logger.info("User logged in: {}", user.getEmail());

        return new AuthDTOs.LoginResponse(token, user.getEmail(), user.getName(), user.getRole());
    }
}
