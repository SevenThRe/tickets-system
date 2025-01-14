package com.icss.etc.ticket;

import com.icss.etc.ticket.entity.vo.ticket.DepartmentStatisticsVO;
import com.icss.etc.ticket.entity.vo.ticket.MonthlyStatisticsVO;
import com.icss.etc.ticket.entity.vo.ticket.TicketStatisticsVO;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.mapper.TicketMapper;
import com.icss.etc.ticket.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@SpringBootTest
class TicketStatisticsTest {

    @Autowired
    private TicketService ticketService;

    @MockBean
    private TicketMapper ticketMapper;

    @Test
    void testGetTicketStatistics() {
        // 准备测试数据
        Long userId = 1L;

        // mock基础统计数据
        when(ticketMapper.countUserTickets(userId)).thenReturn(100);

        Map<TicketStatus, Integer> statusCount = new HashMap<>();
        statusCount.put(TicketStatus.PENDING, 20);
        statusCount.put(TicketStatus.PROCESSING, 30);
        statusCount.put(TicketStatus.COMPLETED, 40);
        statusCount.put(TicketStatus.CLOSED, 10);
        when(ticketMapper.countByStatus(userId)).thenReturn(statusCount);

        when(ticketMapper.calculateAvgProcessTime(userId)).thenReturn(24.5);
        when(ticketMapper.calculateAvgSatisfaction(userId)).thenReturn(4.5);

        // mock月度统计数据
        List<MonthlyStatisticsVO> monthlyStats = new ArrayList<>();
        monthlyStats.add(new MonthlyStatisticsVO("2024-01", 30, 25, 83.33, 20.5));
        when(ticketMapper.getMonthlyStatistics(userId)).thenReturn(monthlyStats);

        // mock部门统计数据
        List<DepartmentStatisticsVO> deptStats = new ArrayList<>();
        deptStats.add(new DepartmentStatisticsVO(1L, "技术部", 50, 10, 20, 20, 22.5, 4.8));
        when(ticketMapper.getDepartmentStatistics()).thenReturn(deptStats);

        // 执行测试
        TicketStatisticsVO statistics = ticketService.getTicketStatistics(userId);

        // 验证结果
        assertNotNull(statistics);
        assertEquals(100, statistics.getTotalCount());
        assertEquals(4.5, statistics.getAvgSatisfaction());

        // 验证状态统计
        Map<String, Integer> actualStatusCount = statistics.getStatusCount();
        assertEquals(20, actualStatusCount.get("PENDING"));
        assertEquals(30, actualStatusCount.get("PROCESSING"));

        // 验证月度统计
        List<MonthlyStatisticsVO> actualMonthlyStats = statistics.getMonthlyStats();
        assertEquals(1, actualMonthlyStats.size());
        assertEquals("2024-01", actualMonthlyStats.get(0).getMonth());

        // 验证部门统计
        List<DepartmentStatisticsVO> actualDeptStats = statistics.getDeptStats();
        assertEquals(1, actualDeptStats.size());
        assertEquals("技术部", actualDeptStats.get(0).getDepartmentName());
    }

    @Test
    void testGetEfficiencyAnalysis() {
        // 准备测试数据
        List<Map<String, Object>> efficiencyRanking = new ArrayList<>();
        Map<String, Object> rankData = new HashMap<>();
        rankData.put("userId", 1L);
        rankData.put("realName", "张三");
        rankData.put("totalCount", 50);
        rankData.put("avgProcessTime", 20.5);
        rankData.put("satisfaction", 4.8);
        efficiencyRanking.add(rankData);

        when(ticketMapper.getEfficiencyRanking()).thenReturn(efficiencyRanking);

        List<Map<String, Object>> workloadData = new ArrayList<>();
        Map<String, Object> workload = new HashMap<>();
        workload.put("departmentId", 1L);
        workload.put("departmentName", "技术部");
        workload.put("totalCount", 100);
        workload.put("processorCount", 5);
        workload.put("avgWorkload", 20.0);
        workloadData.add(workload);

        when(ticketMapper.getDepartmentWorkload()).thenReturn(workloadData);

        // 执行测试
        Map<String, Object> result = ticketService.getEfficiencyAnalysis();

        // 验证结果
        assertNotNull(result);

        List<Map<String, Object>> actualRanking =
                (List<Map<String, Object>>) result.get("efficiencyRanking");
        assertEquals(1, actualRanking.size());
        assertEquals("张三", actualRanking.get(0).get("realName"));

        List<Map<String, Object>> actualWorkload =
                (List<Map<String, Object>>) result.get("departmentWorkload");
        assertEquals(1, actualWorkload.size());
        assertEquals("技术部", actualWorkload.get(0).get("departmentName"));
    }
}