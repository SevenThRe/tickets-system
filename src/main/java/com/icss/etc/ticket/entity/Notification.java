package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

import com.icss.etc.ticket.enums.NotifyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Notification} 
 *  通知表
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 通知表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Notification implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    // 常量定义
    public static final int UNREAD = 0;
    public static final int READ = 1;
    public static final int NOT_DELETED = 0;
    public static final int DELETED = 1;

    private Long notificationId;
    private Long userId;
    private Long ticketId;
    private NotifyType notifyType;
    private String content;

    // 将@Builder.Default移到字段上
    @Builder.Default
    private Integer isRead = UNREAD;

    @Builder.Default
    private Integer isDeleted = NOT_DELETED;

    @Builder.Default
    private LocalDateTime createTime = LocalDateTime.now();

    // 便捷方法
    public boolean isUnread() {
        return UNREAD == this.isRead;
    }

    public void markAsRead() {
        this.isRead = READ;
    }

    // 添加删除标记方法
    public void markAsDeleted() {
        this.isDeleted = DELETED;
    }

    // 添加是否已删除判断
    public boolean isDeleted() {
        return DELETED == this.isDeleted;
    }
}