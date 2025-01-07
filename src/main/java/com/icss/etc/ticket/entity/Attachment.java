package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Attachment} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 附件表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Attachment implements Serializable {
    /**
     * 附件ID
     */
    private Long attachmentId;

    /**
     * 工单ID
     */
    private Long ticketId;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件路径
     */
    private String filePath;

    /**
     * 文件大小(字节)
     */
    private Long fileSize;

    /**
     * 文件类型
     */
    private String fileType;

    /**
     * 是否删除
     */
    private Integer isDeleted;

    /**
     * 上传人
     */
    private Long createBy;

    /**
     * 上传时间
     */
    private LocalDateTime createTime;

    @Serial
    private static final long serialVersionUID = 1L;
}