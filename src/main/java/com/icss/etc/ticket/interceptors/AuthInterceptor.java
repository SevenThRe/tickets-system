package com.icss.etc.ticket.interceptors;

import com.icss.etc.ticket.annotation.RequirePermissions;
import com.icss.etc.ticket.annotation.RequireRoles;
import com.icss.etc.ticket.enums.Logical;
import com.icss.etc.ticket.exceptions.UnauthorizedException;
import com.icss.etc.ticket.service.PermissionService;
import com.icss.etc.ticket.util.JWTUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.lang.reflect.Method;

@Slf4j
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private PermissionService permissionService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 1. 非HandlerMethod直接放行(如资源文件请求)
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        // 从请求头中获取名为 "Authorization" 的 token 值
        String token = request.getHeader("token");

        // 2. 获取并验证token
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            log.warn("用户未登录,请求被拦截! 请求路径: {}", request.getRequestURI());
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }

        try {
            // 3. 验证token并获取用户信息
            Claims claims = JWTUtils.verifyToken(token);
            Long userId = Long.valueOf(claims.getSubject());
            String username = claims.get("username", String.class);
            String role = claims.get("role", String.class);

            // 4. 将用户信息存入请求属性
            request.setAttribute("userId", userId);
            request.setAttribute("username", username);
            request.setAttribute("role", role);

            // 5. 检查权限注解
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            Method method = handlerMethod.getMethod();
            Class<?> declaringClass = method.getDeclaringClass();

            // 检查类级别注解
            checkPermissionAnnotation(declaringClass.getAnnotation(RequirePermissions.class), userId);
            checkRoleAnnotation(declaringClass.getAnnotation(RequireRoles.class), userId);

            // 检查方法级别注解
            checkPermissionAnnotation(method.getAnnotation(RequirePermissions.class), userId);
            checkRoleAnnotation(method.getAnnotation(RequireRoles.class), userId);

            // 6. 更新token
            String newToken = JWTUtils.updateToken(token);
            if (!newToken.equals(token)) {
                response.setHeader("Authorization", newToken);
            }
            // 将新 token 放入响应头
            response.setHeader("token", newToken);
            log.info("用户已登录, 请求路径: {}", request.getRequestURI());
            // 放行请求
            return true;
        } catch (UnauthorizedException e) {
            log.warn("权限校验失败! 请求路径: {}, 原因: {}", request.getRequestURI(), e.getMessage());
            response.setStatus(HttpStatus.FORBIDDEN.value());
            return false;
        } catch (Exception e) {
            log.error("Token解析失败! 请求路径: {}, Token: {}", request.getRequestURI(), token, e);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }
    }

    /**
     * 检查权限注解
     */
    private void checkPermissionAnnotation(RequirePermissions annotation, Long userId) {
        if (annotation != null) {
            String[] permissions = annotation.value();
            Logical logical = annotation.logical();
            if (!permissionService.checkPermissions(permissions, userId, logical)) {
                throw new UnauthorizedException("缺少所需权限");
            }
        }
    }

    /**
     * 检查角色注解
     */
    private void checkRoleAnnotation(RequireRoles annotation, Long userId) {
        if (annotation != null) {
            String[] roles = annotation.value();
            Logical logical = annotation.logical();
            if (!permissionService.checkRoles(roles, userId, logical)) {
                throw new UnauthorizedException("缺少所需角色");
            }
        }
    }
}