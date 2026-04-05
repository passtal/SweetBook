package com.chatterbook.controller;

import com.chatterbook.service.BookPrintApiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookPrintApiService apiService;
    private final ObjectMapper objectMapper;

    public BookController(BookPrintApiService apiService, ObjectMapper objectMapper) {
        this.apiService = apiService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<JsonNode> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(apiService.listBooks(status, limit, offset));
    }

    @PostMapping
    public ResponseEntity<JsonNode> create(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        String bookSpecUid = body.get("bookSpecUid");
        return ResponseEntity.ok(apiService.createBook(title, bookSpecUid));
    }

    @GetMapping("/{bookUid}")
    public ResponseEntity<JsonNode> get(@PathVariable String bookUid) {
        return ResponseEntity.ok(apiService.getBook(bookUid));
    }

    @DeleteMapping("/{bookUid}")
    public ResponseEntity<JsonNode> delete(@PathVariable String bookUid) {
        return ResponseEntity.ok(apiService.deleteBook(bookUid));
    }

    // ==================== Photos ====================

    @PostMapping("/{bookUid}/photos")
    public ResponseEntity<JsonNode> uploadPhoto(
            @PathVariable String bookUid,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(apiService.uploadPhoto(bookUid, file));
    }

    @GetMapping("/{bookUid}/photos")
    public ResponseEntity<JsonNode> listPhotos(@PathVariable String bookUid) {
        return ResponseEntity.ok(apiService.listPhotos(bookUid));
    }

    // ==================== Cover ====================

    @PostMapping("/{bookUid}/cover")
    public ResponseEntity<JsonNode> createCover(
            @PathVariable String bookUid,
            @RequestParam("templateUid") String templateUid,
            @RequestParam("parameters") String parametersJson,
            MultipartHttpServletRequest request) throws IOException {

        Map<String, Object> parameters = objectMapper.readValue(parametersJson, Map.class);

        Set<String> excludeFields = Set.of("templateUid", "parameters");
        Map<String, MultipartFile> files = new java.util.HashMap<>();
        request.getFileMap().forEach((name, file) -> {
            if (!excludeFields.contains(name)) files.put(name, file);
        });

        if (!files.isEmpty()) {
            return ResponseEntity.ok(apiService.createCoverWithFiles(bookUid, templateUid, parameters, files));
        }

        return ResponseEntity.ok(apiService.createCover(bookUid, templateUid, parameters));
    }

    // ==================== Contents ====================

    @PostMapping("/{bookUid}/contents")
    public ResponseEntity<JsonNode> addContent(
            @PathVariable String bookUid,
            @RequestParam("templateUid") String templateUid,
            @RequestParam("parameters") String parametersJson,
            @RequestParam(value = "breakBefore", defaultValue = "page") String breakBefore,
            MultipartHttpServletRequest request) throws IOException {

        Map<String, Object> parameters = objectMapper.readValue(parametersJson, Map.class);

        Set<String> excludeFields = Set.of("templateUid", "parameters", "breakBefore");
        Map<String, MultipartFile> files = new java.util.HashMap<>();
        request.getFileMap().forEach((name, file) -> {
            if (!excludeFields.contains(name)) files.put(name, file);
        });

        if (!files.isEmpty()) {
            return ResponseEntity.ok(apiService.addContentWithFiles(bookUid, templateUid, parameters, breakBefore, files));
        }
        return ResponseEntity.ok(apiService.addContent(bookUid, templateUid, parameters, breakBefore));
    }

    @DeleteMapping("/{bookUid}/contents")
    public ResponseEntity<JsonNode> clearContents(@PathVariable String bookUid) {
        return ResponseEntity.ok(apiService.clearContents(bookUid));
    }

    // ==================== Finalize ====================

    @PostMapping("/{bookUid}/finalize")
    public ResponseEntity<JsonNode> finalize(@PathVariable String bookUid) {
        return ResponseEntity.ok(apiService.finalizeBook(bookUid));
    }
}
