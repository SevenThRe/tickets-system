package com.icss.etc.ticket.config;

import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.util.PropertiesUtil;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.MultipartConfigElement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

import java.io.File;

/**
 * {@code FileUploadConfig}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Configuration
@Slf4j
public class FileUploadConfig {

    @Autowired
    private PropertiesUtil propertiesUtil;

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();

        String maxSize = propertiesUtil.getProperty("upload.maxSize", "10"); // 默认10MB
        long maxFileSize = Long.parseLong(maxSize);

        factory.setMaxFileSize(DataSize.ofMegabytes(maxFileSize));
        factory.setMaxRequestSize(DataSize.ofMegabytes(maxFileSize * 5));

        return factory.createMultipartConfig();
    }

    @PostConstruct
    public void init() {
        try {
            String uploadPath = propertiesUtil.getProperty("upload.path", "./uploads");

            // 创建上传目录
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists() && !uploadDir.mkdirs()) {
                log.error("创建上传目录失败: {}", uploadPath);
                throw new BusinessException(CodeEnum.INTERNAL_ERROR, "创建上传目录失败");
            }

            log.info("文件上传配置初始化完成, 上传路径: {}, 最大文件大小: {}MB",
                    uploadPath,
                    propertiesUtil.getProperty("upload.maxSize", "10"));

        } catch (Exception e) {
            log.error("初始化文件上传配置失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "初始化文件上传配置失败");
        }
    }
}