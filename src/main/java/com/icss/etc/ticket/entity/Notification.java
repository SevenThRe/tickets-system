package com.icss.etc.ticket.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Notification} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
/**
 * 通知表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Notification implements Serializable {
    /**
    * 通知ID
    */
    private Long notification_id;

    /**
    * 接收用户ID
    */
    private Long user_id;

    /**
    * 相关工单ID
    */
    private Long ticket_id;

    /**
    * 通知类型：0-工单分配，1-工单转交，2-工单完成，3-其他
    */
    private Integer notify_type;

    /**
    * 通知内容
    */
    private String content;

    /**
    * 是否已读：0-未读，1-已读
    */
    private Integer is_read;

    /**
    * 是否删除
    */
    private Integer is_deleted;

    /**
    * 创建时间
    */
    private LocalDateTime create_time;

    private static final long serialVersionUID = 1L;
}