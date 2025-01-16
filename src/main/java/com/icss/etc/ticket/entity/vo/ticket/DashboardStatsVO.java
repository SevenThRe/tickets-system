package com.icss.etc.ticket.entity.vo.ticket;

import com.icss.etc.ticket.entity.dto.ticket.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * {@code DashboardStatsVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class DashboardStatsVO {
    private Long pendingCount;      // 待处理工单数
    private Long processingCount;   // 处理中工单数
    private Long completedCount;    // 已完成工单数
    private Double avgSatisfaction; // 平均满意度
    private List<TicketTrendVO> trends;  // 工单趋势
    private List<TicketTypeStatsVO> types;  // 工单类型分布
}
