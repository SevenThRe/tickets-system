package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 工单表
 * t_ticket
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Ticket implements Serializable {
    /**
     * 工单ID
     */
    private Long ticket_id;

    /**
     * 工单类型ID
     */
    private Long type_id;

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
    private Long processor_id;

    /**
     * 处理部门ID
     */
    private Long department_id;

    /**
     * 优先级：0-普通，1-紧急，2-非常紧急
     */
    private Byte priority;

    /**
     * 状态：0-待处理，1-处理中，2-已完成，3-已关闭
     */
    private Byte status;

    /**
     * 期望完成时间
     */
    private LocalDateTime expect_finish_time;

    /**
     * 实际完成时间
     */
    private LocalDateTime actual_finish_time;

    /**
     * 是否删除
     */
    private Byte is_deleted;

    /**
     * 创建人
     */
    private Long create_by;

    /**
     * 更新人
     */
    private Long update_by;

    /**
     * 创建时间
     */
    private LocalDateTime create_time;

    /**
     * 更新时间
     */
    private LocalDateTime update_time;

    @Serial
    private static final long serialVersionUID = 1L;

}