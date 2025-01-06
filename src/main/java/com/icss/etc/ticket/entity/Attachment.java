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
    private Long attachment_id;

    /**
    * 工单ID
    */
    private Long ticket_id;

    /**
    * 文件名
    */
    private String file_name;

    /**
    * 文件路径
    */
    private String file_path;

    /**
    * 文件大小(字节)
    */
    private Long file_size;

    /**
    * 文件类型
    */
    private String file_type;

    /**
    * 是否删除
    */
    private Integer is_deleted;

    /**
    * 上传人
    */
    private Long create_by;

    /**
    * 上传时间
    */
    private LocalDateTime create_time;

    @Serial
    private static final long serialVersionUID = 1L;
}