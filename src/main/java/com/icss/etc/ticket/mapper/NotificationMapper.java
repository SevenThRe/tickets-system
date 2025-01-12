package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Notification;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code NotificationMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface NotificationMapper {

    /**
     * 插入通知
     *
     * @param notification 通知对象
     * @return 影响行数
     */
    int insert(Notification notification);

    /**
     * 更新通知
     * @param notification 通知对象
     * @return 影响行数
     */
    int update(Notification notification);

    /**
     * 根据通知ID查询通知
     * @param notificationId 通知ID
     * @return 通知对象
     */
    Notification selectById(Long notificationId);

    /**
     * 根据用户ID查询通知
     * @param userId 用户ID
     * @return 通知列表
     */
    List<Notification> selectByUserId(Long userId);

    /**
     * 根据用户ID 查询未读通知
     * @param userId 用户ID
     * @return 通知列表
     */
    List<Notification> selectUnreadByUserId(Long userId);

    /**
     * 根据通知ID标记为已读
     * @param notificationId 通知ID
     * @return 影响行数
     */
    int markAsRead(Long notificationId);

    /**
     * 根据用户ID标记为全部已读
     * @param userId 用户ID
     * @return 影响行数
     */
    int markAllAsRead(Long userId);

    /**
     * 根据通知ID标记为已删除
     * @param notificationId 通知ID
     * @return 影响行数
     */
    int markAsDeleted(Long notificationId);


    /**
     * 根据用户ID标记为已删除
     * @param userId 用户ID
     * @return 影响行数
     */
    int deleteById(Long notificationId);

    /**
     * 根据工单ID删除通知
     * @param ticketId 工单ID
     * @return 影响行数
     */
    int deleteByTicketId(Long ticketId);
}