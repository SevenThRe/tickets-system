package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.sys.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

/**
 * {@code SystemConfigService}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface SystemConfigService {
    ConfigResponse getSystemConfig();


    /**
     * 更新基本配置
     * @param config {@link GeneralConfig}
     */
    void updateGeneralConfig(GeneralConfig config);

    /**
     * 更新缓存配置
     * @param config {@link CacheConfig}
     */
    void updateCacheConfig(CacheConfig config);

    /**
     * 更新日志配置
     * @param config {@link LogConfig}
     */
    void updateLogConfig(LogConfig config);

    /**
     * 更新上传配置
     * @param config {@link UploadConfig}
     */
    void updateUploadConfig(UploadConfig config);

    /**
     * 获取系统名称配置
     * @return 系统名称
     */
    String getSystemName();

    int updateSystemLogo(MultipartFile systemLogo);
}
