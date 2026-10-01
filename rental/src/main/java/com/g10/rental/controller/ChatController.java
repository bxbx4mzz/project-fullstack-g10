package com.g10.rental.controller;

import com.g10.rental.dto.chat.ChatRequest;
import com.g10.rental.dto.chat.ChatResponse;
import com.g10.rental.service.ChatService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@AllArgsConstructor 
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
        @Valid @RequestBody ChatRequest request
    ) {
        String response = chatService.chat(request.message());

        return ResponseEntity.ok(new ChatResponse(response));
    }
}