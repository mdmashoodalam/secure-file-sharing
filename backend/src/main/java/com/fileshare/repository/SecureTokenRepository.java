package com.fileshare.repository;

import com.fileshare.model.SecureToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecureTokenRepository extends JpaRepository<SecureToken, Long> {

    // Find token by its string value
    Optional<SecureToken> findByToken(String token);
}
