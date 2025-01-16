package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.dto.ticket.RecentTicketDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketRecentDTO;
import com.icss.etc.ticket.entity.vo.ticket.DashboardStatsVO;
import com.icss.etc.ticket.entity.vo.ticket.DepartmentWorkloadVO;
import com.icss.etc.ticket.entity.vo.ticket.SystemOverviewVO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.enums.TicketStatus;
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

    /**
     * 获取仪表板统计数据
     */
    @GetMapping("/stats")
    public R<DashboardStatsVO> getStats() {
        try {
            DashboardStatsVO stats = new DashboardStatsVO();

            // 获取工单数量统计
            stats.setPendingCount(ticketService.countByStatus(TicketStatus.PENDING));
            stats.setProcessingCount(ticketService.countByStatus(TicketStatus.PROCESSING));
            stats.setCompletedCount(ticketService.countByStatus(TicketStatus.COMPLETED));

            // 获取平均满意度
            stats.setAvgSatisfaction(ticketService.calculateAvgSatisfaction());

            // 获取工单趋势数据（最近7天）
            stats.setTrends(ticketService.getTicketTrends(7));

            // 获取工单类型分布
            stats.setTypes(ticketService.getTicketTypeDistribution());

            return R.OK(stats);
        } catch (Exception e) {
            log.error("获取仪表板统计数据失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    /**
     * 获取最近工单列表
     */
    @GetMapping("/recent-tickets")
    public R<List<RecentTicketDTO>> getRecentTickets(
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<RecentTicketDTO> tickets = ticketService.getRecentTickets(limit);
            return R.OK(tickets);
        } catch (Exception e) {
            log.error("获取最近工单列表失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    /**
     * 获取部门工作量统计
     */
    @GetMapping("/department-stats")
    public R<List<DepartmentWorkloadVO>> getDepartmentStats() {
        try {
            List<DepartmentWorkloadVO> stats = departmentService.getWorkloadStats();
            return R.OK(stats);
        } catch (Exception e) {
            log.error("获取部门工作量统计失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }

    /**
     * 获取系统概览数据
     */
    @GetMapping("/system-overview")
    public R<SystemOverviewVO> getSystemOverview() {
        try {
            SystemOverviewVO overview = new SystemOverviewVO();
//            overview.setTotalUsers(userService.countActiveUsers());
//            overview.setTotalDepartments(departmentService.countDepartments());
//            overview.setTotalTickets(ticketService.countTotalTickets());
            return R.OK(overview);
        } catch (Exception e) {
            log.error("获取系统概览数据失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }
}
