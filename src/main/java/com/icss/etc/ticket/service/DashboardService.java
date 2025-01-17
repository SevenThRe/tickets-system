package com.icss.etc.ticket.service;
import com.icss.etc.ticket.entity.vo.RecentTicketVO;
import com.icss.etc.ticket.entity.vo.ticket.DashboardStatsVO;
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
public interface DashboardService {

    /**
     * 获取仪表板统计数据
     */
    DashboardStatsVO getDashboardStats();

    /**
     * 获取最近工单列表
     */
    List<RecentTicketVO> getRecentTickets(Integer limit);
}