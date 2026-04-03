package com.chatterbook.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleWebClientError(WebClientResponseException ex) {
        log.error("Book Print API 호출 실패: {} {}", ex.getStatusCode(), ex.getResponseBodyAsString());

        // 외부 API 에러 body에서 사용자 친화적 메시지 추출
        String rawBody = ex.getResponseBodyAsString();
        java.util.List<String> errors = new java.util.ArrayList<>();
        String message = "Book Print API 에러: " + ex.getStatusText();

        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(rawBody);
            if (node.has("errors") && node.get("errors").isArray()) {
                for (var e : node.get("errors")) {
                    errors.add(e.asText());
                }
            }
            if (node.has("message")) {
                message = node.get("message").asText();
            }
        } catch (Exception parseEx) {
            errors.add(rawBody);
        }

        if (errors.isEmpty()) errors.add(message);

        return ResponseEntity
                .status(ex.getStatusCode().value())
                .body(Map.of(
                        "success", false,
                        "message", message,
                        "errors", errors
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericError(Exception ex) {
        log.error("서버 에러 발생: ", ex);
        return ResponseEntity
                .status(500)
                .body(Map.of(
                        "success", false,
                        "message", ex.getMessage() != null ? ex.getMessage() : "알 수 없는 에러",
                        "errors", java.util.List.of(ex.getClass().getSimpleName())
                ));
    }
}
