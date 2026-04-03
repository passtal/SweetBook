package com.chatterbook.dto;

import java.util.Map;

public record ContentPageRequest(
        String templateUid,
        Map<String, Object> parameters
) {}
