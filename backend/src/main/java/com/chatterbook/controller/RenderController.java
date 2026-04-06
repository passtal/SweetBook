package com.chatterbook.controller;

import com.chatterbook.service.BookPrintApiService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/render")
public class RenderController {

    private final BookPrintApiService apiService;

    public RenderController(BookPrintApiService apiService) {
        this.apiService = apiService;
    }

    @PostMapping("/page-thumbnail")
    public ResponseEntity<JsonNode> renderPageThumbnail(@RequestBody Map<String, Object> body) {
        String bookUid = (String) body.get("bookUid");
        int pageNum = ((Number) body.get("pageNum")).intValue();
        return ResponseEntity.ok(apiService.renderPageThumbnail(bookUid, pageNum));
    }

    @GetMapping("/thumbnail/{bookUid}/{fileName}")
    public ResponseEntity<byte[]> getThumbnailImage(
            @PathVariable String bookUid,
            @PathVariable String fileName) {
        byte[] image = apiService.getThumbnailImage(bookUid, fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }
}
