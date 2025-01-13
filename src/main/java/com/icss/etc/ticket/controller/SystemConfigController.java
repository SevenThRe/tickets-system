package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.sys.*;
import com.icss.etc.ticket.service.SystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * {@code SystemConfigController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping(value = "/config", produces = "application/json;charset=UTF-8")
@Slf4j
public class SystemConfigController {

    @Autowired
    private SystemConfigService configService;

    @GetMapping("/system")
    public R<ConfigResponse> getSystemConfig() {
        try {
            ConfigResponse config = configService.getSystemConfig();
            return R.OK(config);
        } catch (Exception e) {
            log.error("获取系统配置失败:", e);
            return R.FAIL();
        }
    }

    @PostMapping("/update-general")
    public R<Void> updateGeneralConfig(@RequestBody GeneralConfig config) {
        try {
            configService.updateGeneralConfig(config);
            return R.OK();
        } catch (Exception e) {
            log.error("更新基本配置失败:", e);
            return R.FAIL();
        }
    }

    @PostMapping("/update-cache")
    public R<Void> updateCacheConfig(@RequestBody CacheConfig config) {
        try {
            configService.updateCacheConfig(config);
            return R.OK();
        } catch (Exception e) {
            log.error("更新缓存配置失败:", e);
            return R.FAIL();
        }
    }

    @PostMapping("/update-log")
    public R<Void> updateLogConfig(@RequestBody LogConfig config) {
        try {
            configService.updateLogConfig(config);
            return R.OK();
        } catch (Exception e) {
            log.error("更新日志配置失败:", e);
            return R.FAIL();
        }
    }

    @PostMapping("/update-upload")
    public R<Void> updateUploadConfig(@RequestBody UploadConfig config) {
        try {
            configService.updateUploadConfig(config);
            return R.OK();
        } catch (Exception e) {
            log.error("更新文件上传配置失败:", e);
            return R.FAIL();
        }
    }
}