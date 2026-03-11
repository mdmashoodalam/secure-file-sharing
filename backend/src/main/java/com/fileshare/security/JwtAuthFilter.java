package com.fileshare.security;

import com.fileshare.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// This filter runs on every request
// It checks if the request has a valid JWT token
// If yes, it sets the user as authenticated
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Step 1: Get the token from the request header
            String jwt = getJwtFromRequest(request);

            // Step 2: If token exists, validate it
            if (StringUtils.hasText(jwt)) {
                String email = jwtUtils.getEmailFromToken(jwt);

                // Step 3: Load user details from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Step 4: Validate token against user details
                if (jwtUtils.validateToken(jwt, userDetails)) {
                    // Step 5: Set authentication in security context
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        // Continue to next filter
        filterChain.doFilter(request, response);
    }

    // Extract JWT token from Authorization header
    // Header format: "Bearer eyJhbGci..."
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Remove "Bearer " prefix and return just the token
            return bearerToken.substring(7);
        }
        return null;
    }
}
