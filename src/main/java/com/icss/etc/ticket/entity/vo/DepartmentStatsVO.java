package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * {@code DepartmentStatsVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatsVO {
    private Integer pendingCount;     // 待处理数量
    private Integer processingCount;  // 处理中数量
    private Integer completedCount;   // 已完成数量
    private Double avgSatisfaction;   // 平均满意度
    private Map<String, Double> trends; // 趋势数据
}