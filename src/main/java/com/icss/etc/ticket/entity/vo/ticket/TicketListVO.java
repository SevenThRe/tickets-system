package com.icss.etc.ticket.entity.vo.ticket;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * {@code TicketListVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class TicketListVO {
    private Long ticketId;            // 工单ID
    private String title;             // 标题
    private String content;           // 内容
    private Long processorId;         // 处理人ID
    private String processorName;     // 处理人姓名
    private Long departmentId;        // 部门ID
    private String departmentName;    // 部门名称
    private Integer priority;         // 优先级
    private Integer status;           // 状态
    private LocalDateTime expectFinishTime;    // 期望完成时间
    private LocalDateTime actualFinishTime;    // 实际完成时间
    private String creatorName;       // 创建人姓名
    private LocalDateTime createTime; // 创建时间
    private LocalDateTime updateTime; // 更新时间
}
