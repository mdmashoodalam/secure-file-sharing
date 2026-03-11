package com.fileshare.repository;

import com.fileshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Spring Data JPA gives us basic CRUD for free
// We just add the custom methods we need
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (used for login)
    Optional<User> findByEmail(String email);

    // Check if email already exists (used for registration)
    boolean existsByEmail(String email);
}
