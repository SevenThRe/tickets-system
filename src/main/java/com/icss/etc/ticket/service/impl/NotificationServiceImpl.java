package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.config.WebSocketServer;
import com.icss.etc.ticket.entity.Notification;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.enums.NotifyType;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.NotificationMapper;
import com.icss.etc.ticket.service.NotificationService;
import com.icss.etc.ticket.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * {@code NotificationServiceImpl}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationMapper notificationMapper;

    @Autowired
    private WebSocketServer webSocketServer;

    /**
     * 创建工单分配通知
     */
    @Override
    public void createAssignNotification(Long ticketId, Long userId, String content) {
        Notification notification = Notification.builder()
                .ticketId(ticketId)
                .userId(userId)
                .notifyType(NotifyType.ASSIGN)
                .content(content)
                .isRead(0)
                .isDeleted(0)
                .createTime(LocalDateTime.now())
                .build();

        saveAndPush(notification);
    }

    /**
     * 创建工单完成通知
     */
    @Override
    public void createCompleteNotification(Long ticketId, Long userId, String content) {
        Notification notification = Notification.builder()
                .ticketId(ticketId)
                .userId(userId)
                .notifyType(NotifyType.COMPLETE)
                .content(content)
                .isRead(0)
                .isDeleted(0)
                .createTime(LocalDateTime.now())
                .build();

        saveAndPush(notification);
    }

    /**
     * 获取所有通知列表
     */
    @Override
    public List<Notification> getNotifications(Long userId) {
        if(userId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "用户ID不能为空");
        }
        return notificationMapper.selectByUserId(userId);
    }

    /**
     * 获取未读通知列表
     */
    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        if(userId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "用户ID不能为空");
        }
        return notificationMapper.selectUnreadByUserId(userId);
    }

    /**
     * 标记通知为已读
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAsRead(Long notificationId) {
        if(notificationId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "通知ID不能为空");
        }
        int rows = notificationMapper.markAsRead(notificationId);
        if(rows == 0) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "标记已读失败");
        }
    }

    /**
     * 标记所有通知为已读
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAllAsRead(Long userId) {
        if(userId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "用户ID不能为空");
        }
        notificationMapper.markAllAsRead(userId);
    }

    /**
     * 标记通知为已删除
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAsDeleted(Long notificationId) {
        if(notificationId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "通知ID不能为空");
        }
        int rows = notificationMapper.markAsDeleted(notificationId);
        if(rows == 0) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "删除通知失败");
        }
    }

    /**
     * 获取未读通知数量
     */
    @Override
    public int getUnreadCount(Long userId) {
        if(userId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "用户ID不能为空");
        }
        List<Notification> unreadList = notificationMapper.selectUnreadByUserId(userId);
        return unreadList != null ? unreadList.size() : 0;
    }

    /**
     * 根据工单ID删除相关通知
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteByTicketId(Long ticketId) {
        if(ticketId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "工单ID不能为空");
        }
        notificationMapper.deleteByTicketId(ticketId);
    }


    /**
     * 保存并推送通知
     */
    private void saveAndPush(Notification notification) {
        if(notification == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "通知对象不能为空");
        }

        try {
            // 1. 保存通知
            int rows = notificationMapper.insert(notification);
            if(rows == 0) {
                throw new BusinessException(CodeEnum.BAD_REQUEST, "保存通知失败");
            }

            // 2. WebSocket推送
            webSocketServer.sendToUser(notification.getUserId(), JsonUtil.toJson(notification));
            log.info("推送通知成功, userId:{}, content:{}", notification.getUserId(), notification.getContent());
        } catch (Exception e) {
            log.error("推送通知失败, userId:{}, content:{}, error:{}",
                    notification.getUserId(), notification.getContent(), e.getMessage());
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "推送通知失败");
        }
    }
}