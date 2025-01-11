package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.service.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * {@code FileServiceImpl}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Service
@Slf4j
public class FileServiceImpl implements FileService {

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.allowedTypes}")
    private List<String> allowedTypes;

    @Value("${upload.maxSize}")
    private long maxFileSize;

    @Override
    public String uploadFile(MultipartFile file, Long ticketId) {
        try {
            // 1. 验证文件
            validateFile(file);

            // 2. 生成文件名
            String fileName = generateFileName(file, ticketId);

            // 3. 保存文件
            File dest = new File(uploadPath + fileName);
            file.transferTo(dest);

            // 4. 返回访问URL
            return "/api/files/" + fileName;
        } catch (IOException e) {
            log.error("文件上传失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR);
        }
    }

    @Override
    public List<String> uploadFiles(MultipartFile[] files, Long ticketId) {
        return Arrays.stream(files)
                .map(file -> uploadFile(file, ticketId))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            File file = new File(uploadPath + fileName);
            if (file.exists()) {
                file.delete();
            }
        } catch (Exception e) {
            log.error("文件删除失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR);
        }
    }

    private void validateFile(MultipartFile file) {
        // 验证文件大小
        if (file.getSize() > maxFileSize * 1024 * 1024) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "文件大小超过限制");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        if (!allowedTypes.contains(contentType)) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "不支持的文件类型");
        }
    }

    private String generateFileName(MultipartFile file, Long ticketId) {
        String originalName = file.getOriginalFilename();
        String extension = originalName.substring(originalName.lastIndexOf("."));
        return String.format("%d_%s%s", ticketId,
                UUID.randomUUID().toString().replaceAll("-", ""),
                extension);
    }
}
