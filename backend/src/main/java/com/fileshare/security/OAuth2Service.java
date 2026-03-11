package com.fileshare.security;

import com.fileshare.model.User;
import com.fileshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OAuth2Service extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request)
            throws OAuth2AuthenticationException {

        // Load user info from Google
        OAuth2User oauthUser = super.loadUser(request);

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // If user doesn't exist in our DB, create them automatically
        if (email != null && !userRepo.existsByEmail(email)) {
            User newUser = new User();
            newUser.setName(name != null ? name : email);
            newUser.setEmail(email);
            // Random password — Google users don't need a password
            newUser.setPassword(UUID.randomUUID().toString());
            newUser.setRole("ROLE_USER");
            userRepo.save(newUser);
            System.out.println("✅ New user created via Google: " + email);
        }

        return oauthUser;
    }
}