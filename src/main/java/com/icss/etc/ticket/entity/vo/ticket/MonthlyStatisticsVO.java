package com.icss.etc.ticket.entity.vo.ticket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code MonthlyStatisticsVO}
 * 月度统计VO
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyStatisticsVO {
    private String month; // 月份(yyyy-MM)
    private Integer totalCount; // 工单总数
    private Integer completedCount; // 已完成数量
    private Double completionRate; // 完成率
    private Double avgProcessTime; // 平均处理时间
}