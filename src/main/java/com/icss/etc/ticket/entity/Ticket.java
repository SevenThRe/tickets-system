package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

import com.icss.etc.ticket.enums.Priority;
import com.icss.etc.ticket.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Ticket} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 工单表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Ticket implements Serializable {
    /**
     * 工单ID
     */
    private Long ticketId;

    /**
     * 工单类型ID
     */
    private Long typeId;

    /**
     * 工单标题
     */
    private String title;

    /**
     * 工单内容
     */
    private String content;

    /**
     * 处理人ID
     */
    private Long processorId;

    /**
     * 处理部门ID
     */
    private Long departmentId;

    /**
     * 优先级：0-普通，1-紧急，2-非常紧急
     */
    private Priority priority;

    /**
     * 状态：0-待处理，1-处理中，2-已完成，3-已关闭
     */
    private TicketStatus status;

    /**
     * 期望完成时间
     */
    private LocalDateTime expectFinishTime;

    /**
     * 实际完成时间
     */
    private LocalDateTime actualFinishTime;

    /**
     * 是否删除
     */
    private Integer isDeleted;

    /**
     * 创建人
     */
    private Long createBy;

    /**
     * 更新人
     */
    private Long updateBy;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    @Serial
    private static final long serialVersionUID = 1L;
}