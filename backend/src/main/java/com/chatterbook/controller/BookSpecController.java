package com.chatterbook.controller;

import com.chatterbook.service.BookPrintApiService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/book-specs")
public class BookSpecController {

    private final BookPrintApiService apiService;

    public BookSpecController(BookPrintApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping
    public ResponseEntity<JsonNode> list() {
        return ResponseEntity.ok(apiService.getBookSpecs());
    }

    @GetMapping("/{bookSpecUid}")
    public ResponseEntity<JsonNode> get(@PathVariable String bookSpecUid) {
        return ResponseEntity.ok(apiService.getBookSpec(bookSpecUid));
    }
}
