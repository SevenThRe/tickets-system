package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.dto.ticket.RecentTicketDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketRecentDTO;
import com.icss.etc.ticket.entity.vo.RecentTicketVO;
import com.icss.etc.ticket.entity.vo.ticket.DashboardStatsVO;
import com.icss.etc.ticket.entity.vo.ticket.DepartmentWorkloadVO;
import com.icss.etc.ticket.entity.vo.ticket.SystemOverviewVO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.service.DashboardService;
import com.icss.etc.ticket.service.DepartmentService;
import com.icss.etc.ticket.service.TicketService;
import com.icss.etc.ticket.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * {@code AdminDashboardController}
 *  写这个类完全是Ticket类方法太多了我看不过来了
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/admin/dashboard")
@Slf4j
public class AdminDashboardController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public R<DashboardStatsVO> getStats() {
        try {
            DashboardStatsVO stats = dashboardService.getDashboardStats();
            return R.OK(stats);
        } catch (Exception e) {
            log.error("获取仪表板统计数据失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    @GetMapping("/recent-tickets")
    public R<List<RecentTicketVO>> getRecentTickets(
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<RecentTicketVO> tickets = dashboardService.getRecentTickets(limit);
            return R.OK(tickets);
        } catch (Exception e) {
            log.error("获取最近工单列表失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }
}
