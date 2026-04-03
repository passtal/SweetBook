package com.chatterbook.controller;

import com.chatterbook.dto.ParsedChat;
import com.chatterbook.parser.KakaoTalkParser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/chat")
public class ChatParserController {

    private final KakaoTalkParser kakaoTalkParser;

    public ChatParserController(KakaoTalkParser kakaoTalkParser) {
        this.kakaoTalkParser = kakaoTalkParser;
    }

    @PostMapping("/parse")
    public ResponseEntity<ParsedChat> parse(
            @RequestParam("file") MultipartFile file,
            @RequestParam("platform") String platform) throws IOException {

        if ("kakaotalk".equalsIgnoreCase(platform)) {
            ParsedChat parsed = kakaoTalkParser.parse(file.getInputStream());
            return ResponseEntity.ok(parsed);
        }

        return ResponseEntity.badRequest().build();
    }
}
