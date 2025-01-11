package com.icss.etc.ticket.entity.dto.ticket;

import com.icss.etc.ticket.enums.Priority;
import com.icss.etc.ticket.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * {@code TicketQueryDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class TicketQueryDTO {
    private Integer pageNum;
    private Integer pageSize;
    private Long userId; // 用户ID(用于查询我的工单)
    private String keyword; // 关键字搜索
    private Long processorId; // 处理人ID
    private Long departmentId; // 部门ID
    private Priority priority; // 优先级
    private TicketStatus status; // 状态
    private LocalDateTime startTime; // 开始时间
    private LocalDateTime endTime; // 结束时间
}