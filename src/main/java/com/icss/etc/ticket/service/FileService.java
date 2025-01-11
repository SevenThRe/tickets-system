package com.icss.etc.ticket.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * {@code FileService}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface FileService {
    /**
     * 上传文件
     * @param file 文件
     * @param ticketId 工单ID
     * @return 文件访问URL
     */
    String uploadFile(MultipartFile file, Long ticketId);

    /**
     * 批量上传文件
     */
    List<String> uploadFiles(MultipartFile[] files, Long ticketId);

    /**
     * 删除文件
     */
    void deleteFile(String fileUrl);
}
