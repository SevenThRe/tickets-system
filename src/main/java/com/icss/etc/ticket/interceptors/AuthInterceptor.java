package com.icss.etc.ticket.interceptors;

import com.icss.etc.ticket.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.icss.etc.ticket.util.JWTUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * {@code AuthInterceptor}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Slf4j
@Component
public class AuthInterceptor implements HandlerInterceptor {

    /**
     * 前置处理
     * 验证用户登录状态,若无效则中断请求
     * @param request 请求对象
     * @param response 响应对象
     * @param handler 处理器对象
     * @return true-放行请求, false-中断请求
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 从请求头中获取名为 "Authorization" 的 token 值
        String token = request.getHeader("Authorization");

        if (token == null || token.isEmpty()) {
            // token 为空,未登录,返回 401 状态码
            log.warn("用户未登录,请求被拦截! 请求路径: {}", request.getRequestURI());
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
        try {
            // 更新并验证 token 有效性
            Claims claims = JWTUtils.verifyToken(token);
            // 将用户信息存入请求属性中，供后续使用
            request.setAttribute("userId", claims.getSubject());
            request.setAttribute("username", claims.get("username"));
            request.setAttribute("role", claims.get("role"));

            // 检查token是否需要更新
            String newToken = JWTUtils.updateToken(token);
            if (!newToken.equals(token)) {
                response.setHeader("Authorization", newToken);
            }
            return true;
        } catch (Exception e) {
            // token 解析失败,返回 401 状态码
            log.error("Token 解析失败! 请求路径: {}, Token: {}", request.getRequestURI(), token);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
    }
}
