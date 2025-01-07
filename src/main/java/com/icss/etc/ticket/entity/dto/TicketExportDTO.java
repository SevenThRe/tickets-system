package com.icss.etc.ticket.entity.dto;

/**
 * {@code TicketExportDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

import java.time.LocalDateTime;

/**
 * 工单导出数据DTO
 */
public record TicketExportDTO(
        String ticketCode,           // 工单编号
        String title,               // 标题
        String content,             // 内容
        String departmentName,      // 部门名称
        String processorName,       // 处理人
        String statusName,          // 状态
        String priorityName,        // 优先级
        LocalDateTime createTime,    // 创建时间
        LocalDateTime expectFinishTime, // 期望完成时间
        LocalDateTime actualFinishTime  // 实际完成时间
) {}
