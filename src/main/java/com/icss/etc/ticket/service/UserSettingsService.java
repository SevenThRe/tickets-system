package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.UserSettings;

/**
 * {@code UserSettingsService}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface UserSettingsService {
    UserSettings getSettingsByUserId(Long userId);
    void updateSettings(UserSettings settings);
}