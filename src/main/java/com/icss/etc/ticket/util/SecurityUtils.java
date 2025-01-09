package com.icss.etc.ticket.util;

import com.icss.etc.ticket.entity.User;
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
    private static final ThreadLocal<User> userHolder = new ThreadLocal<>();

    public static void setCurrentUser(User user) {
        userHolder.set(user);
    }

    public static Long getCurrentUserId() {
        User user = userHolder.get();
        if (user == null) {
            throw new IllegalStateException("未获取到当前登录用户");
        }
        return user.getUserId();
    }

    public static void clear() {
        userHolder.remove();
    }
}