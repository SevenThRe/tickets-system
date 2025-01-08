package com.icss.etc.ticket.entity.vo;

import com.icss.etc.ticket.enums.Priority;
import com.icss.etc.ticket.enums.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime; /**
 * 工单信息响应DTO
 */
@Data
public class TicketVO {
    /**
     * 工单ID
     */
    private Long ticketId;

    /**
     * 工单编号
     */
    private String ticketCode;

    /**
     * 标题
     */
    private String title;

    /**
     * 部门名称
     */
    private String departmentName;

    /**
     * 处理人姓名
     */
    private String processorName;

    /**
     * 状态(0-待处理,1-处理中,2-已完成,3-已关闭)
     */
    private TicketStatus status;

    /**
     * 优先级(0-普通,1-紧急,2-非常紧急)
     */
    private Priority priority;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 期望完成时间
     */
    private LocalDateTime expectFinishTime;
}
