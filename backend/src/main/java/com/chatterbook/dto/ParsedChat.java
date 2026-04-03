package com.chatterbook.dto;

import java.util.List;

public record ParsedChat(
        String platform,
        String chatTitle,
        List<String> participants,
        List<ChatMessage> messages,
        int totalMessages,
        String dateRange
) {}
