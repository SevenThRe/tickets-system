package com.icss.etc.ticket.entity.vo;

import lombok.Data;

/**
 * {@code RecentTicketVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class RecentTicketVO {
    private Long ticketId;         // 工单ID
    private String title;          // 标题
    private String typeName;       // 类型
    private String status;         // 状态
    private String priority;       // 优先级
    private String createTime;     // 创建时间
    private String creatorName;    // 创建人
    private String departmentName; // 部门名称
    private String processorName;  // 处理人
    private Long processorId;    // 处理人ID
    private Long creatorId;    // 处理人ID

}
