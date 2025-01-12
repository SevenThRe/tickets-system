package com.icss.etc.ticket.entity.vo.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code DepartmentStatisticsVO}
 * 部门统计VO
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentStatisticsVO {
    private Long departmentId;
    private String departmentName;
    private Integer totalCount; // 工单总数
    private Integer pendingCount; // 待处理数量
    private Integer processingCount; // 处理中数量
    private Integer completedCount; // 已完成数量
    private Double avgProcessTime; // 平均处理时间
    private Double satisfaction; // 满意度
}
