package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.Attachment;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.AttachmentMapper;
import com.icss.etc.ticket.service.FileService;
import com.icss.etc.ticket.util.PropertiesUtil;
import com.icss.etc.ticket.util.SecurityUtils;
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
import java.time.LocalDateTime;
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

    @GetMapping("/check/{ticketId}/{fileName}")
    public R<Boolean> checkFile(@PathVariable Long ticketId, @PathVariable String fileName) {
        try {
            // 先从数据库验证附件记录
            Attachment attachment = attachmentMapper.selectByAll(
                    Attachment.builder()
                            .ticketId(ticketId)
                            .fileName(fileName)
                            .isDeleted(0)
                            .build()
            ).stream().findFirst().orElse(null);

            if (attachment == null) {
                return R.OK(false);
            }
            String uploadPath = propertiesUtil.getProperty("upload.path");
            if (uploadPath == null) {
                throw new BusinessException(CodeEnum.INTERNAL_ERROR,"上传路径未配置");
            }
            if (!uploadPath.endsWith("\\")) {
                uploadPath += "\\";
            }
            String filePath = attachment.getFilePath();
            // 验证物理文件
            File file = new File(uploadPath + filePath);
            if (!file.exists()) {
                throw new BusinessException(CodeEnum.NOT_FOUND,"文件不存在");
            }
            return R.OK(file.exists());
        } catch (Exception e) {
            log.error("检查文件是否存在失败: {}", fileName, e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    @GetMapping("/download/{ticketId}/{fileName}")
    public R downloadFile(@PathVariable Long ticketId,
                             @PathVariable String fileName,
                             HttpServletResponse response) {
        try {
            // 验证附件记录
            Attachment attachment = attachmentMapper.selectByAll(
                    Attachment.builder()
                            .ticketId(ticketId)
                            .fileName(fileName)
                            .isDeleted(0)
                            .build()
            ).stream().findFirst().orElse(null);

            if (attachment == null) {
                return R.FAIL(CodeEnum.NOT_FOUND);
            }

            File file = new File(propertiesUtil.getProperty("upload.path") + fileName);
            if (!file.exists()) {
                return R.FAIL(CodeEnum.NOT_FOUND);
            }

            // 设置响应头
            response.setContentType(Files.probeContentType(file.toPath()));
            response.setHeader("Content-Disposition", "attachment; filename=" +
                    URLEncoder.encode(fileName, StandardCharsets.UTF_8));

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
            log.error("文件下载失败: {}", fileName, e);
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