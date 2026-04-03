package com.chatterbook.dto;

import java.util.List;

public record ChatMessage(
        String sender,
        String timestamp,
        String message,
        List<String> imageUrls
) {}
