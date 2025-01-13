package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.util.PropertiesUtil;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;
import java.nio.file.Files;

/**
 * {@code FileController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/files")
@Slf4j
public class FileController {

    @Autowired
    private PropertiesUtil propertiesUtil;

    private String uploadPath;


    @PostConstruct
    public void init() {
        this.uploadPath = propertiesUtil.getProperty("upload.path", "./uploads/");
        log.info("File controller initialized with upload path: {}", uploadPath);
    }


    @GetMapping("/{fileName}")
    public void getFile(@PathVariable String fileName, HttpServletResponse response) throws IOException {
        File file = new File(uploadPath + fileName);
        if (!file.exists()) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return;
        }

        // 设置响应头
        response.setContentType(Files.probeContentType(file.toPath()));
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        // 写入响应流
        try (InputStream in = new FileInputStream(file);
             OutputStream out = response.getOutputStream()) {
            byte[] buffer = new byte[4096];
            int length;
            while ((length = in.read(buffer)) > 0) {
                out.write(buffer, 0, length);
            }
            out.flush();
        } catch (IOException e) {
            log.error("文件下载失败: {}", fileName, e);
            throw e;
        }
    }
}