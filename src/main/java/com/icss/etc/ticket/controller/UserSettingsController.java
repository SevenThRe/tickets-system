package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.UserSettings;
import com.icss.etc.ticket.service.UserSettingsService;
import com.icss.etc.ticket.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * {@code UserSettingController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/api/users/settings")
@Slf4j
public class UserSettingsController {

    @Autowired
    private UserSettingsService userSettingsService;

    /**
     * 获取用户通知设置
     */
    @GetMapping
    public R<UserSettings> getSettings() {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            UserSettings settings = userSettingsService.getSettingsByUserId(userId);
            return R.OK(settings);
        } catch (Exception e) {
            log.error("获取用户设置失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 更新用户通知设置
     */
    @PutMapping
    public R<Void> updateSettings(@RequestBody UserSettings settings) {
        try {
            Long userId = SecurityUtils.getCurrentUserId();
            settings.setUserId(userId);
            userSettingsService.updateSettings(settings);
            return R.OK();
        } catch (Exception e) {
            log.error("更新用户设置失败:", e);
            return R.FAIL();
        }
    }
}