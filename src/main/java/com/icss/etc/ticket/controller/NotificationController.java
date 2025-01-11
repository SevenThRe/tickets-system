package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.Notification;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.service.NotificationService;
import com.icss.etc.ticket.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * {@code NotificationController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/notifications")
@Slf4j
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // 获取未读通知列表
    @GetMapping("/unread")
    public R<List<Notification>> getUnreadNotifications() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            return R.OK(notifications);
        } catch(Exception e) {
            log.error("获取未读通知失败:", e);
            return R.FAIL();
        }
    }

    // 获取所有通知
    @GetMapping
    public R<List<Notification>> getAllNotifications() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            List<Notification> notifications = notificationService.getNotifications(userId);
            return R.OK(notifications);
        } catch(Exception e) {
            log.error("获取通知失败:", e);
            return R.FAIL();
        }
    }

    // 标记通知为已读
    @PutMapping("/{notificationId}/read")
    public R<Void> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return R.OK();
        } catch(Exception e) {
            log.error("标记通知已读失败:", e);
            return R.FAIL();
        }
    }

    // 标记所有通知为已读
    @PutMapping("/read/all")
    public R<Void> markAllAsRead() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            notificationService.markAllAsRead(userId);
            return R.OK();
        } catch(Exception e) {
            log.error("标记所有通知已读失败:", e);
            return R.FAIL();
        }
    }

    // 删除通知
    @DeleteMapping("/{notificationId}")
    public R<Void> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.markAsDeleted(notificationId);
            return R.OK();
        } catch(Exception e) {
            log.error("删除通知失败:", e);
            return R.FAIL();
        }
    }

    // 获取未读通知数量
    @GetMapping("/unread/count")
    public R<Integer> getUnreadCount() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            int count = notificationService.getUnreadCount(userId);
            return R.OK(count);
        } catch(Exception e) {
            log.error("获取未读通知数量失败:", e);
            return R.FAIL();
        }
    }
}