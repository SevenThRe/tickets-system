package com.icss.etc.ticket.util;

import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Properties;

/**
 * Properties工具类 - 用于管理系统配置
 */
@Slf4j
@Component
public class PropertiesUtil {

    /** 配置文件名称 */
    private static final String CONFIG_FILE = "options.properties";

    /** 配置对象 */
    private final Properties properties;

    /** 配置文件对象 */
    private final File configFile;

    /**
     * 构造方法
     * @param configPath 配置路径
     */
    public PropertiesUtil(@Value("${config.path:./config}") String configPath) {
        // 1. 创建配置目录
        File configDir = new File(configPath);
        if (!configDir.exists() && !configDir.mkdirs()) {
            log.error("创建配置目录失败: {}", configPath);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "创建配置目录失败");
        }

        // 2. 初始化配置文件
        this.configFile = new File(configDir, CONFIG_FILE);
        if (!configFile.exists()) {
            copyDefaultConfig();
        }

        // 3. 初始化配置对象并加载
        this.properties = new Properties();
        loadProperties();
    }

    /**
     * 从 classpath 复制默认配置文件
     */
    private void copyDefaultConfig() {
        try {
            Resource defaultConfig = new ClassPathResource(CONFIG_FILE);
            try (InputStream in = defaultConfig.getInputStream();
                 FileOutputStream out = new FileOutputStream(configFile)) {
                byte[] buffer = new byte[1024];
                int len;
                while ((len = in.read(buffer)) != -1) {
                    out.write(buffer, 0, len);
                }
                log.info("复制默认配置文件成功: {}", configFile.getAbsolutePath());
            }
        } catch (IOException e) {
            log.error("复制默认配置文件失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "初始化配置失败");
        }
    }

    /**
     * 加载配置文件
     */
    private void loadProperties() {
        try (Reader reader = new InputStreamReader(new FileInputStream(configFile), StandardCharsets.UTF_8)) {
            properties.load(reader);
            log.debug("加载配置文件成功: {}", configFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("加载配置文件失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "加载配置文件失败");
        }
    }

    /**
     * 保存配置到文件
     */
    public void saveProperties() {
        try (Writer writer = new OutputStreamWriter(new FileOutputStream(configFile), StandardCharsets.UTF_8)) {
            properties.store(writer, "Updated by System");
            log.info("保存配置文件成功: {}", configFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("保存配置文件失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "保存配置文件失败");
        }
    }

    /**
     * 获取配置项
     */
    public String getProperty(String key) {
        return properties.getProperty(key);
    }

    /**
     * 获取配置项(带默认值)
     */
    public String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    /**
     * 设置配置项
     */
    public void setProperty(String key, String value) {
        if (value == null) {
            properties.remove(key);
        } else {
            properties.setProperty(key, value);
        }
    }

    /**
     * 批量更新配置
     */
    public void updateProperties(Map<String, String> props) {
        props.forEach(this::setProperty);
        saveProperties();
    }

    /**
     * 检查配置项是否存在
     */
    public boolean containsKey(String key) {
        return properties.containsKey(key);
    }

    /**
     * 移除配置项
     */
    public void removeProperty(String key) {
        properties.remove(key);
    }

    /**
     * 获取全部配置
     */
    public Properties getAllProperties() {
        Properties copy = new Properties();
        copy.putAll(properties);
        return copy;
    }

    /**
     * 重新加载配置
     */
    public void reload() {
        loadProperties();
        log.info("重新加载配置文件成功");
    }

    /**
     * 获取配置文件路径
     */
    public String getConfigPath() {
        return configFile.getAbsolutePath();
    }
}