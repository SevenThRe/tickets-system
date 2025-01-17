package com.icss.etc.ticket.mapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
/**
 * {@code DashboardMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface DashboardMapper {

    /**
     * 统计不同状态的工单数量
     */
    Long countTicketsByStatus(@Param("status") Integer status);

    /**
     * 获取工单评价的平均分
     */
    Double getAverageSatisfactionScore();

    /**
     * 获取指定时间范围内的工单趋势
     */
    List<Map<String,Object>> getTicketTrendStats(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * 获取工单类型分布
     */
    List<Map<String,Object>> getTicketTypeStats();

    /**
     * 获取最近的工单列表
     */
    List<Map<String,Object>> getRecentTickets(@Param("limit") Integer limit);
}