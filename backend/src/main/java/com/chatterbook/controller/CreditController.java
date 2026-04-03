package com.chatterbook.controller;

import com.chatterbook.service.BookPrintApiService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/credits")
public class CreditController {

    private final BookPrintApiService apiService;

    public CreditController(BookPrintApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping
    public ResponseEntity<JsonNode> getBalance() {
        return ResponseEntity.ok(apiService.getCredits());
    }

    @GetMapping("/transactions")
    public ResponseEntity<JsonNode> getTransactions(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(apiService.getTransactions(limit));
    }
}
