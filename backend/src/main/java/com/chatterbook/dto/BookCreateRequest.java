package com.chatterbook.dto;

import java.util.List;
import java.util.Map;

public record BookCreateRequest(
        String title,
        String bookSpecUid,
        String coverTemplateUid,
        String contentTemplateUid,
        Map<String, String> coverParameters,
        List<ContentPageRequest> pages
) {}
