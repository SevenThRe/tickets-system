package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.vo.RecentTicketVO;
import com.icss.etc.ticket.entity.vo.ticket.DashboardStatsVO;
import com.icss.etc.ticket.service.DashboardService;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.mapper.DashboardMapper;
import com.icss.etc.ticket.entity.vo.ticket.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;

/**
 * {@code DashboardServiceImpl}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private DashboardMapper dashboardMapper;

    @Override
    public DashboardStatsVO getDashboardStats() {
        DashboardStatsVO statsVO = new DashboardStatsVO();

        // 1. 获取各状态工单数量
        statsVO.setPendingCount(dashboardMapper.countTicketsByStatus(TicketStatus.PENDING.getValue()));
        statsVO.setProcessingCount(dashboardMapper.countTicketsByStatus(TicketStatus.PROCESSING.getValue()));
        statsVO.setCompletedCount(dashboardMapper.countTicketsByStatus(TicketStatus.COMPLETED.getValue()));

        // 2. 获取平均满意度
        Double avgScore = dashboardMapper.getAverageSatisfactionScore();
        statsVO.setAvgSatisfaction(avgScore != null ? avgScore : 0.0);

        // 3. 获取最近7天趋势
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(6);
        List<Map<String,Object>> trendData = dashboardMapper.getTicketTrendStats(startDate, endDate);

        // 转换趋势数据
        List<TicketTrendVO> trends = trendData.stream().map(data -> {
            TicketTrendVO trend = new TicketTrendVO();
            trend.setDate(data.get("date").toString());
            trend.setNewCount(Long.valueOf(data.get("new_count").toString()));
            trend.setCompletedCount(Long.valueOf(data.get("completed_count").toString()));
            return trend;
        }).collect(Collectors.toList());
        statsVO.setTrends(trends);

        // 4. 获取类型分布
        List<Map<String,Object>> typeData = dashboardMapper.getTicketTypeStats();

        // 转换类型分布数据
        List<TicketTypeStatsVO> types = typeData.stream().map(data -> {
            TicketTypeStatsVO type = new TicketTypeStatsVO();
            type.setTypeName(data.get("type_name").toString());
            type.setCount(Long.valueOf(data.get("count").toString()));
            type.setProportion(Double.valueOf(data.get("proportion").toString()));
            return type;
        }).collect(Collectors.toList());
        statsVO.setTypes(types);

        return statsVO;
    }

    @Override
    public List<RecentTicketVO> getRecentTickets(Integer limit) {
        List<Map<String, Object>> ticketData = dashboardMapper.getRecentTickets(limit);

        return ticketData.stream().map(data -> {
            RecentTicketVO ticket = new RecentTicketVO();
            // 必须存在的字段
            ticket.setTicketId(Long.valueOf(data.get("ticket_id").toString()));
            ticket.setTitle(data.get("title").toString());
            ticket.setStatus(data.get("status").toString());
            ticket.setPriority(data.get("priority").toString());
            ticket.setCreateTime(data.get("createTime").toString());

            // 可能为空的字段，需要安全处理
            ticket.setTypeName(Optional.ofNullable(data.get("type_name"))
                    .map(Object::toString)
                    .orElse("-"));

            ticket.setCreatorName(Optional.ofNullable(data.get("creator_name"))
                    .map(Object::toString)
                    .orElse("-"));

            ticket.setDepartmentName(Optional.ofNullable(data.get("department_name"))
                    .map(Object::toString)
                    .orElse("-"));

            ticket.setProcessorName(Optional.ofNullable(data.get("processor_name"))
                    .map(Object::toString)
                    .orElse("未分配"));

            // 处理ID字段
            ticket.setProcessorId(Optional.ofNullable(data.get("processor_id"))
                    .map(id -> Long.valueOf(id.toString()))
                    .orElse(-1L));

            ticket.setCreatorId(Optional.ofNullable(data.get("creator_id"))
                    .map(id -> Long.valueOf(id.toString()))
                    .orElse(-1L));

            return ticket;
        }).collect(Collectors.toList());
    }
}