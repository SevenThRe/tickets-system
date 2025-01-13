package com.icss.etc.ticket.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * {@code UserSetting}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class UserSettings {
    private Long id;
    private Long userId;
    private Boolean ticketNotification; // 工单提醒
    private Boolean processNotification; // 处理进度提醒
    private Boolean systemNotification; // 系统消息
    private LocalDateTime updateTime;
    private LocalDateTime createTime;
}