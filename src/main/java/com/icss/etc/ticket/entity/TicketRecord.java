package com.icss.etc.ticket.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code TicketRecord} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
/**
 * 工单处理记录表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketRecord implements Serializable {
    /**
    * 记录ID
    */
    private Long record_id;

    /**
    * 工单ID
    */
    private Long ticket_id;

    /**
    * 操作人ID
    */
    private Long operator_id;

    /**
    * 操作类型：0-创建，1-分配，2-处理，3-完成，4-关闭，5-转交
    */
    private Integer operation_type;

    /**
    * 操作内容
    */
    private String operation_content;

    /**
    * 评分(1-5)
    */
    private Integer evaluation_score;

    /**
    * 评价内容
    */
    private String evaluation_content;

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