package com.icss.etc.ticket.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * {@code OnlineUserManager}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class OnlineUserManager {
    private static final String ONLINE_USER_KEY = "online_users";
    private static final int EXPIRE_TIME = 30; // 30分钟过期
//    依赖注入不上 换JAVA 原生内存管理
//    @Autowired
//    private RedisTemplate<String, Object> redisTemplate;
    private final ConcurrentHashMap<Long, LocalDateTime> onlineUsers = new ConcurrentHashMap<>();

    /**
     * 用户上线
     */
    public void userOnline(Long userId) {
        try {
            onlineUsers.put(userId, LocalDateTime.now());
            // 模拟过期机制
            new Thread(() -> {
                try {
                    Thread.sleep(EXPIRE_TIME);
                    onlineUsers.remove(userId);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
        } catch (Exception e) {
            log.error("记录用户在线状态失败, userId: {}", userId, e);
        }
    }

    /**
     * 用户下线
     */
    public void userOffline(Long userId) {
        try {
            onlineUsers.remove(userId);
        } catch (Exception e) {
            log.error("移除用户在线状态失败, userId: {}", userId, e);
        }
    }

    /**
     * 更新用户在线状态（心跳更新）
     */
    public void updateUserStatus(Long userId) {
        userOnline(userId);
    }

    /**
     * 检查用户是否在线
     */
    public boolean isUserOnline(Long userId) {
        try {
            LocalDateTime lastActiveTime = onlineUsers.get(userId);
            if (lastActiveTime == null) {
                return false;
            }
            return LocalDateTime.now().minusSeconds(EXPIRE_TIME / 1000).isBefore(lastActiveTime);
        } catch (Exception e) {
            log.error("检查用户在线状态失败, userId: {}", userId, e);
            return false;
        }
    }

    /**
     * 获取部门在线用户IDs
     */
    public Set<Long> getOnlineUsersByDepartment(Long departmentId, List<Long> departmentUserIds) {
        try {
            Set<Long> onlineUsers = new HashSet<>();
            for (Long userId : departmentUserIds) {
                if (isUserOnline(userId)) {
                    onlineUsers.add(userId);
                }
            }
            return onlineUsers;
        } catch (Exception e) {
            log.error("获取部门在线用户失败, departmentId: {}", departmentId, e);
            return Collections.emptySet();
        }
    }
}
