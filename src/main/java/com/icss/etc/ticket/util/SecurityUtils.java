package com.icss.etc.ticket.util;

import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * {@code SecurityUtils}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
public class SecurityUtils {
    private static final ThreadLocal<Long> userIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> userNameHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> roleHolder = new ThreadLocal<>();

    public static void setCurrentUser(Long userId, String username, String role) {
        userIdHolder.set(userId);
        userNameHolder.set(username);
        roleHolder.set(role);
    }

    public static Long getCurrentUserId() {
        Long userId = userIdHolder.get();
        if (userId == null) {
//            throw new BusinessException(CodeEnum.UNKNOW_USER);
            return 20L;
        }
        return userId;
    }

    public static String getCurrentUsername() {
        return userNameHolder.get();
    }

    public static String getCurrentRole() {
        return roleHolder.get();
    }

    public static void clear() {
        userIdHolder.remove();
        userNameHolder.remove();
        roleHolder.remove();
    }
}