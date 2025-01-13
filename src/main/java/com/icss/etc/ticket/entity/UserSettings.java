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
    private Boolean ticketNotification;
    private Boolean processNotification;
    private Boolean systemNotification;

    private Boolean twoFactorAuth;
    private Boolean loginNotification;

    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}