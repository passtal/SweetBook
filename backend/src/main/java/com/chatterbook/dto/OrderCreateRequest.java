package com.chatterbook.dto;

import java.util.List;

public record OrderCreateRequest(
        List<OrderItem> items,
        ShippingInfo shipping,
        String externalRef
) {
    public record OrderItem(String bookUid, int quantity) {}

    public record ShippingInfo(
            String recipientName,
            String recipientPhone,
            String postalCode,
            String address1,
            String address2,
            String memo
    ) {}
}
