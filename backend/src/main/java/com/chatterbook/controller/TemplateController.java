package com.chatterbook.controller;

import com.chatterbook.service.BookPrintApiService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final BookPrintApiService apiService;

    public TemplateController(BookPrintApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping
    public ResponseEntity<JsonNode> list(
            @RequestParam(required = false) String bookSpecUid,
            @RequestParam(required = false) String templateKind,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(apiService.getTemplates(bookSpecUid, templateKind, category));
    }

    @GetMapping("/{templateUid}")
    public ResponseEntity<JsonNode> get(@PathVariable String templateUid) {
        return ResponseEntity.ok(apiService.getTemplate(templateUid));
    }
}
