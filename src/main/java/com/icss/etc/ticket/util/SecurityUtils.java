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
//            throw new IllegalStateException("未获取到当前登录用户");
            new User().builder().userId(1L).
                    username("admin").password("admin")
                    .realName("管理员").departmentId(1L).
                    email("admin@admin.com").phone("12345678901").
                    status(1).isDeleted(0).createBy(1L).
                    updateBy(1L).createTime(LocalDateTime.now()).
                    updateTime(LocalDateTime.now()). build();
        }
        return user.getUserId();
    }

    public static void clear() {
        userHolder.remove();
    }
}