package com.fileshare.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

// This wraps all our API responses in a consistent format
// Every response will look like:
// { "success": true, "message": "...", "data": {...} }
@Data
@JsonInclude(JsonInclude.Include.NON_NULL) // Don't include null fields in JSON
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    // Success response with data
    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        return response;
    }

    // Success response without data
    public static <T> ApiResponse<T> success(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        return response;
    }

    // Error response
    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}
