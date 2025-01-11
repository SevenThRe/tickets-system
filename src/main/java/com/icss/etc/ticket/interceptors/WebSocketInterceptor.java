package com.icss.etc.ticket.interceptors;

import com.icss.etc.ticket.util.JWTUtils;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

/**
 * {@code WebSocketInterceptor} 用于拦截WebSocket请求，并验证用户身份。
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class WebSocketInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        // 获取token，验证用户身份
        HttpHeaders headers = request.getHeaders();
        List<String> tokens = headers.get("Authorization");
        if (tokens != null && !tokens.isEmpty()) {
            String token = tokens.get(0);
            try {
                // 验证token并获取用户ID
                Claims claims = JWTUtils.verifyToken(token);
                Long userId = Long.parseLong(claims.getSubject());
                // 将用户ID存入WebSocket session
                attributes.put("userId", userId);
                return true;
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (log.isDebugEnabled()) {
            log.debug("WebSocket握手完成");
        }
    }
}