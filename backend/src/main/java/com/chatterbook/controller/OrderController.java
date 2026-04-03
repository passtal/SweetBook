package com.chatterbook.controller;

import com.chatterbook.dto.OrderCreateRequest;
import com.chatterbook.service.BookPrintApiService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final BookPrintApiService apiService;

    public OrderController(BookPrintApiService apiService) {
        this.apiService = apiService;
    }

    @GetMapping
    public ResponseEntity<JsonNode> list(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(apiService.listOrders(status, limit, offset));
    }

    @GetMapping("/{orderUid}")
    public ResponseEntity<JsonNode> get(@PathVariable String orderUid) {
        return ResponseEntity.ok(apiService.getOrder(orderUid));
    }

    @PostMapping("/estimate")
    public ResponseEntity<JsonNode> estimate(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        return ResponseEntity.ok(apiService.estimateOrder(items));
    }

    @PostMapping
    public ResponseEntity<JsonNode> create(@RequestBody OrderCreateRequest request) {
        List<Map<String, Object>> items = request.items().stream()
                .map(item -> Map.<String, Object>of(
                        "bookUid", item.bookUid(),
                        "quantity", item.quantity()))
                .collect(Collectors.toList());

        Map<String, String> shipping = Map.of(
                "recipientName", request.shipping().recipientName(),
                "recipientPhone", request.shipping().recipientPhone(),
                "postalCode", request.shipping().postalCode(),
                "address1", request.shipping().address1(),
                "address2", request.shipping().address2() != null ? request.shipping().address2() : "",
                "memo", request.shipping().memo() != null ? request.shipping().memo() : ""
        );

        return ResponseEntity.ok(apiService.createOrder(items, shipping, request.externalRef()));
    }

    @PostMapping("/{orderUid}/cancel")
    public ResponseEntity<JsonNode> cancel(
            @PathVariable String orderUid,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("cancelReason", "사용자 취소");
        return ResponseEntity.ok(apiService.cancelOrder(orderUid, reason));
    }
}
