package com.icss.etc.ticket.entity.vo.ticket;

import com.icss.etc.ticket.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * {@code TicketStatisticsVO}
 * 工单统计信息
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketStatisticsVO {
    private Integer totalCount; // 总工单数
    private Map<TicketStatus, Integer> statusCount; // 各状态工单数量
    private Double avgProcessTime; // 平均处理时间(小时)
    private Double avgSatisfaction; // 平均满意度
    private List<MonthlyStatisticsVO> monthlyStats; // 月度统计
    private List<DepartmentStatisticsVO> deptStats; // 部门统计
}
