package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.compress.utils.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.nio.file.Files;

/**
 * {@code FilePreviewController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/files")
public class FilePreviewController {

    @Value("${upload.path}")
    private String uploadPath;

    @GetMapping("/preview/{fileName}")
    public void previewFile(@PathVariable String fileName, HttpServletResponse response) {
        File file = new File(uploadPath + fileName);
        if (!file.exists()) {
            throw new BusinessException(CodeEnum.NOT_FOUND);
        }

        try {
            String contentType = Files.probeContentType(file.toPath());
            response.setContentType(contentType);

            // 如果是图片，直接输出
            if (contentType.startsWith("image/")) {
                try (InputStream in = new FileInputStream(file);
                     OutputStream out = response.getOutputStream()) {
                    IOUtils.copy(in, out);
                }
            }
            // 如果是PDF，直接预览
            else if (contentType.equals("application/pdf")) {
                response.setHeader("Content-Disposition", "inline; filename=" + fileName);
                try (InputStream in = new FileInputStream(file);
                     OutputStream out = response.getOutputStream()) {
                    IOUtils.copy(in, out);
                }
            }
            // 其他类型，提供下载
            else {
                response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
                try (InputStream in = new FileInputStream(file);
                     OutputStream out = response.getOutputStream()) {
                    IOUtils.copy(in, out);
                }
            }
        } catch (IOException e) {
            throw new BusinessException(CodeEnum.INTERNAL_ERROR);
        }
    }
}
