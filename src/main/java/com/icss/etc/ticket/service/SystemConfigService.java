package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.sys.*;

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
}
