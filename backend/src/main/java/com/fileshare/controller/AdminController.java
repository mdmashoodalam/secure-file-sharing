package com.fileshare.controller;

import com.fileshare.dto.ApiResponse;
import com.fileshare.model.User;
import com.fileshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Admin-only endpoints
// All methods here require ROLE_ADMIN
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepo;

    // GET /api/admin/users
    // Get all users in the system
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    // DELETE /api/admin/users/{id}
    // Delete a user by ID
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        if (!userRepo.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
        }
        userRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    // PUT /api/admin/users/{id}/role
    // Change a user's role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {

        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only allow valid roles
        if (!role.equals("ROLE_USER") && !role.equals("ROLE_ADMIN")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role. Use ROLE_USER or ROLE_ADMIN"));
        }

        user.setRole(role);
        User updated = userRepo.save(user);
        return ResponseEntity.ok(ApiResponse.success("User role updated", updated));
    }
}
