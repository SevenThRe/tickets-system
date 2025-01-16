package com.icss.etc.ticket.entity.vo.ticket;

import lombok.Data;

import java.math.BigDecimal;

/**
 * {@code DepartmentWorkloadVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class DepartmentWorkloadVO {
    private Long departmentId;      // 部门ID
    private String departmentName;  // 部门名称
    private Long ticketCount;       // 工单数量
    private Long processingCount;   // 处理中数量
    private BigDecimal completionRate; // 完成率
}
