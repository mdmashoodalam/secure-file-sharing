package com.fileshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SecureFileSharingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureFileSharingApplication.class, args);
        System.out.println("🚀 Secure File Sharing App is running on http://localhost:8080");
    }
}
