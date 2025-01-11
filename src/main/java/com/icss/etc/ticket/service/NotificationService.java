package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.Notification;

import java.util.List;

/**
 * {@code NotificationService}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface NotificationService {
    void createAssignNotification(Long ticketId, Long userId, String content);

    void createCompleteNotification(Long ticketId, Long userId, String content);

    List<Notification> getUnreadNotifications(Long userId);

    void markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

    List<Notification> getNotifications(Long userId);
    void markAsDeleted(Long notificationId);
    int getUnreadCount(Long userId);

    /**
     * 根据工单ID删除相关通知
     */
    void deleteByTicketId(Long ticketId);

}

