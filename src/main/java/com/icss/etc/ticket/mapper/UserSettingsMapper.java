package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.UserSettings;

/**
 * {@code UserSettingsMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface UserSettingsMapper {
    UserSettings selectByUserId(Long userId);

    void updateByPrimaryKeySelective(UserSettings settings);

    void insert(UserSettings settings);
}
