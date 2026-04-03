package com.chatterbook.parser;

import com.chatterbook.dto.ChatMessage;
import com.chatterbook.dto.ParsedChat;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class KakaoTalkParser {

    // 카카오톡 내보내기 형식:
    // --------------- 2026년 1월 15일 수요일 ---------------
    // [홍길동] [오후 3:21] 안녕하세요
    private static final Pattern DATE_LINE = Pattern.compile(
            "^-+ (\\d{4}년 \\d{1,2}월 \\d{1,2}일 .+?) -+$");
    private static final Pattern MSG_LINE = Pattern.compile(
            "^\\[(.+?)] \\[(오전|오후) (\\d{1,2}:\\d{2})] (.+)$");
    private static final Pattern HEADER_LINE = Pattern.compile(
            "^(.+) 님과 카카오톡 대화$|^(.+)의? 대화$|^(.+) 카카오톡 대화$");

    public ParsedChat parse(InputStream inputStream) throws IOException {
        List<ChatMessage> messages = new ArrayList<>();
        Set<String> participants = new LinkedHashSet<>();
        String chatTitle = "카카오톡 대화";
        String currentDate = "";
        String firstDate = null;
        String lastDate = null;

        StringBuilder currentMessage = null;
        String currentSender = null;
        String currentTimestamp = null;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            String line;
            int lineNum = 0;

            while ((line = reader.readLine()) != null) {
                lineNum++;
                line = line.trim();
                if (line.isEmpty()) continue;

                // BOM 제거
                if (lineNum == 1 && line.charAt(0) == '\uFEFF') {
                    line = line.substring(1);
                }

                // 헤더 라인 (첫 줄: "홍길동 님과 카카오톡 대화")
                if (lineNum <= 2) {
                    Matcher headerMatcher = HEADER_LINE.matcher(line);
                    if (headerMatcher.matches()) {
                        chatTitle = line;
                        continue;
                    }
                    // "저장한 날짜 : 2026년..." 등 스킵
                    if (line.startsWith("저장한 날짜")) continue;
                }

                // 날짜 구분선
                Matcher dateMatcher = DATE_LINE.matcher(line);
                if (dateMatcher.matches()) {
                    // 이전 메시지 저장
                    if (currentSender != null && currentMessage != null) {
                        messages.add(new ChatMessage(currentSender, currentTimestamp,
                                currentMessage.toString().trim(), List.of()));
                    }
                    currentDate = dateMatcher.group(1);
                    if (firstDate == null) firstDate = currentDate;
                    lastDate = currentDate;
                    currentSender = null;
                    currentMessage = null;
                    continue;
                }

                // 메시지 라인
                Matcher msgMatcher = MSG_LINE.matcher(line);
                if (msgMatcher.matches()) {
                    // 이전 메시지 저장
                    if (currentSender != null && currentMessage != null) {
                        messages.add(new ChatMessage(currentSender, currentTimestamp,
                                currentMessage.toString().trim(), List.of()));
                    }

                    currentSender = msgMatcher.group(1);
                    String ampm = msgMatcher.group(2);
                    String time = msgMatcher.group(3);
                    currentTimestamp = currentDate + " " + ampm + " " + time;
                    currentMessage = new StringBuilder(msgMatcher.group(4));

                    participants.add(currentSender);
                    continue;
                }

                // 시스템 메시지 (입장, 퇴장 등)
                if (line.contains("님이 들어왔습니다") || line.contains("님이 나갔습니다") ||
                        line.contains("님을 초대했습니다") || line.contains("채팅방 관리자가")) {
                    continue;
                }

                // 이어지는 줄 (멀티라인 메시지)
                if (currentMessage != null) {
                    currentMessage.append("\n").append(line);
                }
            }

            // 마지막 메시지 저장
            if (currentSender != null && currentMessage != null) {
                messages.add(new ChatMessage(currentSender, currentTimestamp,
                        currentMessage.toString().trim(), List.of()));
            }
        }

        String dateRange = (firstDate != null && lastDate != null)
                ? firstDate + " ~ " + lastDate
                : "날짜 정보 없음";

        return new ParsedChat(
                "kakaotalk",
                chatTitle,
                new ArrayList<>(participants),
                messages,
                messages.size(),
                dateRange
        );
    }
}
