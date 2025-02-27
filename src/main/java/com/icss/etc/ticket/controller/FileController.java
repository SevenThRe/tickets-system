package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.Attachment;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.AttachmentMapper;
import com.icss.etc.ticket.service.FileService;
import com.icss.etc.ticket.util.PropertiesUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;

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
    private FileService fileService;

    @Autowired
    private AttachmentMapper attachmentMapper;

    @Autowired
    private PropertiesUtil propertiesUtil;

    @GetMapping("/check/{ticketId}/{filePath}")
    public R<Boolean> checkFile(@PathVariable Long ticketId, @PathVariable String filePath) {
        try {

            log.info("正在校验文件 - ticketId: {}, filePath: {}", ticketId, filePath);


            // 先从数据库验证附件记录
            Attachment attachment = attachmentMapper.selectByAll(
                    Attachment.builder()
                            .ticketId(ticketId)
                            .filePath(filePath)
                            .isDeleted(0)
                            .build()
            ).stream().findFirst().orElse(null);

            if (attachment == null) {
                log.error("附件不存在: {}", filePath);
                return R.FAIL(CodeEnum.NOT_FOUND);
            }
            String uploadPath = propertiesUtil.getProperty("upload.path");
            log.info("当前配置的上传路径: {}", uploadPath);

            if (uploadPath == null) {
                throw new BusinessException(CodeEnum.INTERNAL_ERROR,"上传路径未配置");
            }
            if (!uploadPath.endsWith("\\")) {
                uploadPath += "\\";
            }

            // 验证物理文件
            File file = new File(uploadPath + filePath);

            log.info("完整文件路径: {}", file.getAbsolutePath());

            if (!file.exists()) {
                log.error("文件不存在: {}", file.getAbsoluteFile());
                throw new BusinessException(CodeEnum.NOT_FOUND,"文件不存在");
            }
            return R.OK(file.exists());
        } catch (Exception e) {
            log.error("检查文件是否存在失败: {}", filePath, e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    @GetMapping("/download/{ticketId}/{filePath}")
    public R downloadFile(@PathVariable Long ticketId,
                             @PathVariable String filePath,
                             HttpServletResponse response) {
        try {
            // 验证附件记录
            Attachment attachment = attachmentMapper.selectByAll(
                    Attachment.builder()
                            .ticketId(ticketId)
                            .filePath(filePath)
                            .isDeleted(0)
                            .build()
            ).stream().findFirst().orElse(null);

            if (attachment == null) {
                log.error("附件不存在: {}", filePath);
                return R.FAIL(CodeEnum.NOT_FOUND);
            }

            String property = propertiesUtil.getProperty("upload.path");
            if (property == null) {
                throw new BusinessException(CodeEnum.INTERNAL_ERROR,"上传路径未配置");
            }
            if (!property.endsWith("\\")) {
                property += "\\";
            }

            File file = new File(property + filePath);
            if (!file.exists()) {
                log.error("文件不存在: {}", file.getAbsoluteFile());
                return R.FAIL(CodeEnum.NOT_FOUND);
            }

            // 设置响应头
            response.setContentType(Files.probeContentType(file.toPath()));
            response.setHeader("Content-Disposition", "attachment; filename=" +
                    URLEncoder.encode(filePath, StandardCharsets.UTF_8));

            try (InputStream in = new FileInputStream(file);
                 OutputStream out = response.getOutputStream()) {
                byte[] buffer = new byte[4096];
                int length;
                while ((length = in.read(buffer)) > 0) {
                    out.write(buffer, 0, length);
                }
                out.flush();
            }
        } catch (Exception e) {
            log.error("文件下载失败: {}", filePath, e);
            R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
        return R.OK();
    }

    /**
     *  获取附件
     * @param ticketId 工单ID
     * @return R<List<Attachment>>
     */
    @GetMapping("/ticket/{ticketId}")
    public R<List<Attachment>> getTicketAttachments(@PathVariable Long ticketId) {
        try {
            List<Attachment> attachments = attachmentMapper.selectByAll(
                    Attachment.builder()
                            .ticketId(ticketId)
                            .isDeleted(0)
                            .build()
            );
            return R.OK(attachments);
        } catch (Exception e) {
            log.error("获取工单附件列表失败, ticketId: {}", ticketId, e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    @PostMapping("/upload/{ticketId}")
    public R<List<String>> uploadFiles(@PathVariable Long ticketId,
                                       @RequestParam("files") MultipartFile[] files) {
        try {
            List<String> fileUrls = fileService.uploadFiles(files, ticketId);
            return R.OK(fileUrls);
        } catch (Exception e) {
            log.error("文件上传失败, ticketId: {}", ticketId, e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    @DeleteMapping("/{attachmentId}")
    public R<Void> deleteAttachment(@PathVariable Long attachmentId) {
        try {
            Attachment attachment = attachmentMapper.selectByPrimaryKey(attachmentId);
            if (attachment == null) {
                return R.FAIL(CodeEnum.NOT_FOUND);
            }

            // 删除物理文件
            fileService.deleteFile(attachment.getFilePath());

            // 更新数据库状态
            attachment.setIsDeleted(1);
            attachmentMapper.updateByPrimaryKey(attachment);

            return R.OK();
        } catch (Exception e) {
            log.error("删除附件失败, attachmentId: {}", attachmentId, e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }
}