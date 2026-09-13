package com.g10.rental.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleProductNotFound(
            ProductNotFoundException ex
    ) {
        return Map.of(
                "status", 404,
                "error", "Not Found",
                "message", ex.getMessage()
        );
    }
}