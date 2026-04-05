package com.chatterbook.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BookPrintApiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public BookPrintApiService(WebClient bookPrintWebClient, ObjectMapper objectMapper) {
        this.webClient = bookPrintWebClient;
        this.objectMapper = objectMapper;
    }

    // ==================== BookSpecs ====================

    public JsonNode getBookSpecs() {
        return webClient.get()
                .uri("/book-specs")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode getBookSpec(String bookSpecUid) {
        return webClient.get()
                .uri("/book-specs/{uid}", bookSpecUid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Templates ====================

    public JsonNode getTemplates(String bookSpecUid, String templateKind, String category) {
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/templates");
                    if (bookSpecUid != null) uriBuilder.queryParam("bookSpecUid", bookSpecUid);
                    if (templateKind != null) uriBuilder.queryParam("templateKind", templateKind);
                    if (category != null) uriBuilder.queryParam("category", category);
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode getTemplate(String templateUid) {
        return webClient.get()
                .uri("/templates/{uid}", templateUid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Books ====================

    public JsonNode listBooks(String status, int limit, int offset) {
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/books")
                            .queryParam("limit", limit)
                            .queryParam("offset", offset);
                    if (status != null) uriBuilder.queryParam("status", status);
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode createBook(String title, String bookSpecUid) {
        Map<String, String> body = Map.of(
                "title", title,
                "bookSpecUid", bookSpecUid
        );
        return webClient.post()
                .uri("/books")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode getBook(String bookUid) {
        // 외부 API가 GET /books/{uid} 단건 조회를 지원하지 않으므로 목록에서 필터링
        JsonNode listResult = listBooks(null, 100, 0);
        JsonNode books = listResult.path("data").path("books");
        if (books.isArray()) {
            for (JsonNode book : books) {
                if (bookUid.equals(book.path("bookUid").asText())) {
                    return objectMapper.createObjectNode()
                            .put("success", true)
                            .put("message", "성공")
                            .set("data", book);
                }
            }
        }
        throw new RuntimeException("책을 찾을 수 없습니다: " + bookUid);
    }

    public JsonNode deleteBook(String bookUid) {
        return webClient.delete()
                .uri("/books/{uid}", bookUid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Photos ====================

    public JsonNode uploadPhoto(String bookUid, MultipartFile file) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        }).contentType(MediaType.parseMediaType(file.getContentType()));

        return webClient.post()
                .uri("/books/{uid}/photos", bookUid)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode listPhotos(String bookUid) {
        return webClient.get()
                .uri("/books/{uid}/photos", bookUid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Cover ====================

    public JsonNode createCover(String bookUid, String templateUid, Map<String, Object> parameters) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("templateUid", templateUid);
        try {
            builder.part("parameters", objectMapper.writeValueAsString(parameters));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize parameters", e);
        }

        return webClient.post()
                .uri("/books/{uid}/cover", bookUid)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode createCoverWithFiles(String bookUid, String templateUid,
                                          Map<String, Object> parameters,
                                          Map<String, MultipartFile> files) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("templateUid", templateUid);
        try {
            builder.part("parameters", objectMapper.writeValueAsString(parameters));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize parameters", e);
        }

        for (Map.Entry<String, MultipartFile> entry : files.entrySet()) {
            MultipartFile file = entry.getValue();
            builder.part(entry.getKey(), new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            }).contentType(MediaType.parseMediaType(file.getContentType()));
        }

        return webClient.post()
                .uri("/books/{uid}/cover", bookUid)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Contents ====================

    public JsonNode addContent(String bookUid, String templateUid,
                                Map<String, Object> parameters, String breakBefore) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("templateUid", templateUid);
        try {
            builder.part("parameters", objectMapper.writeValueAsString(parameters));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize parameters", e);
        }

        String breakParam = breakBefore != null ? breakBefore : "page";

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/books/{uid}/contents")
                        .queryParam("breakBefore", breakParam)
                        .build(bookUid))
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode addContentWithFiles(String bookUid, String templateUid,
                                         Map<String, Object> parameters, String breakBefore,
                                         Map<String, MultipartFile> files) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("templateUid", templateUid);
        try {
            builder.part("parameters", objectMapper.writeValueAsString(parameters));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize parameters", e);
        }

        for (Map.Entry<String, MultipartFile> entry : files.entrySet()) {
            MultipartFile file = entry.getValue();
            builder.part(entry.getKey(), new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            }).contentType(MediaType.parseMediaType(file.getContentType()));
        }

        String breakParam = breakBefore != null ? breakBefore : "page";

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/books/{uid}/contents")
                        .queryParam("breakBefore", breakParam)
                        .build(bookUid))
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode clearContents(String bookUid) {
        return webClient.delete()
                .uri("/books/{uid}/contents", bookUid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Finalize ====================

    public JsonNode finalizeBook(String bookUid) {
        return webClient.post()
                .uri("/books/{uid}/finalization", bookUid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Orders ====================

    public JsonNode estimateOrder(List<Map<String, Object>> items) {
        Map<String, Object> body = Map.of("items", items);
        return webClient.post()
                .uri("/orders/estimate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode createOrder(List<Map<String, Object>> items,
                                 Map<String, String> shipping, String externalRef) {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("items", items);
        body.put("shipping", shipping);
        if (externalRef != null) body.put("externalRef", externalRef);

        return webClient.post()
                .uri("/orders")
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode listOrders(Integer status, int limit, int offset) {
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/orders")
                            .queryParam("limit", limit)
                            .queryParam("offset", offset);
                    if (status != null) uriBuilder.queryParam("status", status);
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode getOrder(String orderUid) {
        return webClient.get()
                .uri("/orders/{uid}", orderUid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode cancelOrder(String orderUid, String reason) {
        Map<String, String> body = Map.of("cancelReason", reason);
        return webClient.post()
                .uri("/orders/{uid}/cancel", orderUid)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // ==================== Credits ====================

    public JsonNode getCredits() {
        return webClient.get()
                .uri("/credits")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode getTransactions(int limit) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/credits/transactions")
                        .queryParam("limit", limit)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }
}
