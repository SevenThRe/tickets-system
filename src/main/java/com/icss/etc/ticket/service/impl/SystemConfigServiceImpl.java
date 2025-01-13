package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.config.SystemConfigLoader;
import com.icss.etc.ticket.entity.sys.*;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.service.SystemConfigService;
import com.icss.etc.ticket.util.PropertiesUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@Slf4j
public class SystemConfigServiceImpl implements SystemConfigService {

    @Autowired
    private PropertiesUtil propertiesUtil;
    @Autowired
    private SystemConfigLoader configLoader;


    @Override
    public void updateGeneralConfig(GeneralConfig config) {
        try {
            propertiesUtil.setProperty("system.name", config.getSystemName());
            propertiesUtil.saveProperties();
            log.info("更新系统名称成功: {}", config.getSystemName());
        } catch (Exception e) {
            log.error("更新系统配置失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "更新配置失败");
        }
    }

    @Override
    public void updateCacheConfig(CacheConfig config) {
        try {
            propertiesUtil.setProperty("cache.enabled", String.valueOf(config.isEnableCache()));
            propertiesUtil.setProperty("cache.expireTime", String.valueOf(config.getExpireTime()));
            propertiesUtil.setProperty("cache.expireTimeUnit", config.getExpireTimeUnit());
            propertiesUtil.setProperty("cache.maxSize", String.valueOf(config.getMaxSize()));
            propertiesUtil.saveProperties();
            log.info("更新缓存配置成功: {}", config);
        } catch (Exception e) {
            log.error("更新缓存配置失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "更新配置失败");
        }
    }

    @Override
    public void updateLogConfig(LogConfig config) {
        try {
            propertiesUtil.setProperty("log.path", config.getLogPath());
            propertiesUtil.setProperty("log.level", config.getLogLevel());
            propertiesUtil.setProperty("log.retentionDays", String.valueOf(config.getLogRetentionDays()));
            propertiesUtil.saveProperties();

            // 重新加载配置
            configLoader.reload();

            log.info("更新日志配置成功: {}", config);
        } catch (Exception e) {
            log.error("更新日志配置失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "更新配置失败");
        }
    }

    @Override
    public void updateUploadConfig(UploadConfig config) {
        try {
            propertiesUtil.setProperty("upload.path", config.getUploadPath());
            propertiesUtil.setProperty("upload.maxSize", String.valueOf(config.getMaxSize()));
            propertiesUtil.setProperty("upload.allowedTypes", String.join(",", config.getAllowedTypes()));
            propertiesUtil.setProperty("upload.avatarPath", String.join(",", config.getAvatarPath()));
            propertiesUtil.saveProperties();
            log.info("更新上传配置成功: {}", config);
        } catch (Exception e) {
            log.error("更新上传配置失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "更新配置失败");
        }
    }

    @Override
    public ConfigResponse getSystemConfig() {
        ConfigResponse response = new ConfigResponse();

        // 基本配置
        GeneralConfig generalConfig = new GeneralConfig();
        generalConfig.setSystemName(propertiesUtil.getProperty("system.name", "工单系统"));
        response.setGeneral(generalConfig);

        // 缓存配置
        CacheConfig cacheConfig = new CacheConfig();
        cacheConfig.setEnableCache(Boolean.parseBoolean(propertiesUtil.getProperty("cache.enabled", "true")));
        cacheConfig.setExpireTime(Integer.parseInt(propertiesUtil.getProperty("cache.expireTime", "10")));
        cacheConfig.setExpireTimeUnit(propertiesUtil.getProperty("cache.expireTimeUnit", "MINUTES"));
        cacheConfig.setMaxSize(Integer.parseInt(propertiesUtil.getProperty("cache.maxSize", "1000")));
        response.setCache(cacheConfig);

        // 日志配置
        LogConfig logConfig = new LogConfig();
        logConfig.setLogPath(propertiesUtil.getProperty("log.path", "/data/ticket/logs"));
        logConfig.setLogLevel(propertiesUtil.getProperty("log.level", "INFO"));
        logConfig.setLogRetentionDays(Integer.parseInt(propertiesUtil.getProperty("log.retentionDays", "30")));
        response.setLog(logConfig);

        // 上传配置
        UploadConfig uploadConfig = new UploadConfig();
        uploadConfig.setUploadPath(propertiesUtil.getProperty("upload.path", "/data/ticket/uploads/"));
        uploadConfig.setMaxSize(Long.parseLong(propertiesUtil.getProperty("upload.maxSize", "10")));
        uploadConfig.setAllowedTypes(Arrays.asList(propertiesUtil.getProperty("upload.allowedTypes", "").split(",")));
        uploadConfig.setAvatarPath(propertiesUtil.getProperty("upload.avatarPath", ""));
        response.setUpload(uploadConfig);

        return response;
    }
}