package com.fileshare.config;

import com.fileshare.security.CustomUserDetailsService;
import com.fileshare.security.JwtAuthFilter;
import com.fileshare.security.OAuth2Service;
import com.fileshare.repository.UserRepository;
import com.fileshare.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private OAuth2Service oAuth2Service;

    @Autowired
    private JwtUtils jwtUtils;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — not needed for REST + JWT
            .csrf(csrf -> csrf.disable())

            // Allow requests from React frontend
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Define which URLs are public
            .authorizeHttpRequests(auth -> auth

                // ✅ Normal auth endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // ✅ Public file download
                .requestMatchers("/api/files/download/public/**").permitAll()

                // ✅ ALL OAuth2 related URLs — must be permitted
                .requestMatchers(
                    "/oauth2/**",
                    "/oauth2/authorization/**",
                    "/oauth2/authorization/google",
                    "/login/oauth2/**",
                    "/login/oauth2/code/**",
                    "/login/oauth2/code/google",
                    "/login/**"
                ).permitAll()

                // Admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Everything else needs a valid JWT
                .anyRequest().authenticated()
            )

            // ✅ IMPORTANT: OAuth2 needs sessions during redirect
            // Cannot use STATELESS for OAuth2 flow
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )

            .authenticationProvider(authenticationProvider())

            // JWT filter runs before Spring's default auth filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // ✅ OAuth2 login configuration
            .oauth2Login(oauth2 -> oauth2
                // Where Spring redirects user to choose Google account
                .authorizationEndpoint(endpoint -> endpoint
                    .baseUri("/oauth2/authorization")
                )
                // Where Google redirects back to after login
                .redirectionEndpoint(endpoint -> endpoint
                    .baseUri("/login/oauth2/code/*")
                )
                // Load/create user from Google profile
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2Service)
                )
                // ✅ On success: generate JWT and redirect to React
                .successHandler((request, response, authentication) -> {
					try {
						handleOAuth2Success(request, response, authentication);
					} catch (Exception e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				})
                // ✅ On failure: redirect to login with error
                .failureHandler((request, response, exception) -> {
                    System.err.println("OAuth2 failed: " + exception.getMessage());
                    response.sendRedirect(
                        "http://localhost:3000/login?error=google_failed"
                    );
                })
            );

        return http.build();
    }

    // Called after successful Google login
    // Generates a JWT token and redirects to React frontend
    private void handleOAuth2Success(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws Exception {

        // Get the Google user info
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        // Load user from our database and generate JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String token = jwtUtils.generateToken(userDetails);

        // Redirect to React with token in URL
        // React will read this token and save it to localStorage
        response.sendRedirect(
            "http://localhost:3000/oauth2/success?token=" + token + "&email=" + email
        );
    }
    // Allow cross-origin requests from React
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:8080"
        ));
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}