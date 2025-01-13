package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.UserSettings;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.UserSettingsMapper;
import com.icss.etc.ticket.service.UserSettingsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * {@code UserSettingsServiceImpl}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Service
@Slf4j
public class UserSettingsServiceImpl implements UserSettingsService {

    @Autowired
    private UserSettingsMapper userSettingsMapper;

    @Override
    public UserSettings getSettingsByUserId(Long userId) {
        UserSettings settings = userSettingsMapper.selectByUserId(userId);
        if(settings == null) {
            // 如果没有设置记录,创建默认设置
            settings = createDefaultSettings(userId);
        }
        return settings;
    }

    @Override
    @Transactional
    public void updateSettings(UserSettings settings) {
        // 校验
        if(settings.getUserId() == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST);
        }

        // 获取原设置
        UserSettings oldSettings = userSettingsMapper.selectByUserId(settings.getUserId());

        if(oldSettings == null) {
            // 新增设置
            settings.setCreateTime(LocalDateTime.now());
            settings.setUpdateTime(LocalDateTime.now());
            userSettingsMapper.insert(settings);
        } else {
            // 更新设置
            settings.setId(oldSettings.getId());
            settings.setUpdateTime(LocalDateTime.now());
            userSettingsMapper.updateByPrimaryKeySelective(settings);
        }
    }
    /**
     * 创建默认设置
     */
    private UserSettings createDefaultSettings(Long userId) {
        UserSettings settings = new UserSettings();
        settings.setUserId(userId);
        settings.setTicketNotification(true);
        settings.setProcessNotification(true);
        settings.setSystemNotification(true);
        settings.setCreateTime(LocalDateTime.now());
        settings.setUpdateTime(LocalDateTime.now());
        userSettingsMapper.insert(settings);
        return settings;
    }
}

