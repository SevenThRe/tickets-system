package com.icss.etc.ticket.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * {@code WebSocketServer}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class WebSocketServer implements WebSocketHandler {

    /**
     * 存放WebSocketSession的Map
     */
    private static final Map<Long, WebSocketSession> USER_SESSIONS = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserId(session);
        USER_SESSIONS.put(userId, session);
        log.info("WebSocket连接建立, userId: {}", userId);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        // 处理收到的消息
        String payload = message.getPayload().toString();
        log.debug("收到WebSocket消息: {}", payload);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        Long userId = getUserId(session);
        log.error("WebSocket传输错误, userId: {}", userId, exception);
        session.close();
        USER_SESSIONS.remove(userId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        Long userId = getUserId(session);
        USER_SESSIONS.remove(userId);
        log.info("WebSocket连接关闭, userId: {}, status: {}", userId, closeStatus);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 发送消息给指定用户
     */
    public void sendToUser(Long userId, String message) {
        WebSocketSession session = USER_SESSIONS.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
                log.debug("发送WebSocket消息成功, userId: {}, message: {}", userId, message);
            } catch (IOException e) {
                log.error("发送WebSocket消息失败, userId: {}", userId, e);
                try {
                    session.close();
                } catch (IOException ex) {
                    log.error("关闭WebSocket session失败", ex);
                }
                USER_SESSIONS.remove(userId);
            }
        } else {
            log.warn("用户WebSocket session不存在或已关闭, userId: {}", userId);
            USER_SESSIONS.remove(userId);
        }
    }

    /**
     * 发送消息给所有在线用户
     */
    public void sendToAll(String message) {
        USER_SESSIONS.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    log.error("发送WebSocket消息失败, userId: {}", userId, e);
                }
            }
        });
    }

    /**
     * 获取用户ID
     */
    private Long getUserId(WebSocketSession session) {
        Map<String, Object> attributes = session.getAttributes();
        Object userIdObj = attributes.get("userId");
        if (userIdObj == null) {
            throw new IllegalStateException("WebSocket session中未找到userId");
        }
        return Long.parseLong(userIdObj.toString());
    }

    /**
     * 获取在线用户数
     */
    public int getOnlineCount() {
        return USER_SESSIONS.size();
    }
}