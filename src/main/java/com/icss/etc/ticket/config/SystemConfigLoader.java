package com.icss.etc.ticket.config;

import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.util.PropertiesUtil;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.core.env.PropertiesPropertySource;

import java.util.Properties;

/**
 * {@code SystemConfigLoader} 系统配置加载器
 * 用于关联自定义配置文件和Spring环境变量，并加载系统配置
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Configuration
@Slf4j
public class SystemConfigLoader implements EnvironmentAware {

    @Autowired
    private PropertiesUtil propertiesUtil;

    private ConfigurableEnvironment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = (ConfigurableEnvironment) environment;
    }

    @PostConstruct
    public void init() {
        try {
            // 创建自定义配置属性源
            Properties customProperties = new Properties();

            // 日志配置映射
            String logPath = propertiesUtil.getProperty("log.path", "./logs");
            String logLevel = propertiesUtil.getProperty("log.level", "INFO");
            int logRetentionDays = Integer.parseInt(propertiesUtil.getProperty("log.retentionDays", "30"));

            // 设置Spring日志配置
            customProperties.setProperty("logging.file.path", logPath);
            customProperties.setProperty("logging.file.name", logPath + "/ticket.log");
            customProperties.setProperty("logging.level.root", logLevel);
            customProperties.setProperty("logging.level.com.icss.etc.ticket", logLevel);

            // 设置日志滚动策略
            customProperties.setProperty("logging.logback.rollingpolicy.max-history", String.valueOf(logRetentionDays));
            customProperties.setProperty("logging.logback.rollingpolicy.max-file-size", "10MB");
            customProperties.setProperty("logging.logback.rollingpolicy.file-name-pattern",
                    logPath + "/ticket-%d{yyyy-MM-dd}.%i.log");

            // 文件上传配置映射
            String uploadPath = propertiesUtil.getProperty("upload.path", "./uploads");
            String maxSize = propertiesUtil.getProperty("upload.maxSize", "10");
            customProperties.setProperty("spring.servlet.multipart.location", uploadPath);
            customProperties.setProperty("spring.servlet.multipart.max-file-size", maxSize + "MB");
            customProperties.setProperty("spring.servlet.multipart.max-request-size", (Integer.parseInt(maxSize) * 5) + "MB");

            // 缓存配置映射
            String cacheEnabled = propertiesUtil.getProperty("cache.enabled", "true");
            customProperties.setProperty("spring.cache.type", cacheEnabled.equals("true") ? "caffeine" : "none");

            // 创建属性源并添加到环境中
            PropertiesPropertySource propertySource =
                    new PropertiesPropertySource("customProperties", customProperties);
            environment.getPropertySources().addFirst(propertySource);

            log.info("系统配置加载完成");
            log.debug("日志配置: path={}, level={}, retention={}天", logPath, logLevel, logRetentionDays);
            log.debug("上传配置: path={}, maxSize={}MB", uploadPath, maxSize);

        } catch (Exception e) {
            log.error("加载系统配置失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "加载系统配置失败");
        }
    }

    /**
     * 重新加载配置
     */
    public void reload() {
        log.info("开始重新加载系统配置...");
        // 移除旧的配置
        environment.getPropertySources().remove("customProperties");
        // 重新初始化
        init();
        log.info("系统配置重新加载完成");
    }
}