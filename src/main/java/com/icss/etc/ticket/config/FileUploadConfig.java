package com.icss.etc.ticket.config;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.MultipartConfigElement;
import org.springframework.beans.factory.annotation.Value;
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
public class FileUploadConfig {
    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.maxSize}")
    private long maxFileSize;

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(maxFileSize));
        factory.setMaxRequestSize(DataSize.ofMegabytes(maxFileSize * 5));
        return factory.createMultipartConfig();
    }

    @PostConstruct
    public void init() {
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }
}