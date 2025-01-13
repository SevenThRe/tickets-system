package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Ticket;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.ticket.DepartmentStatisticsVO;
import com.icss.etc.ticket.entity.vo.ticket.MonthlyStatisticsVO;
import com.icss.etc.ticket.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import org.apache.ibatis.annotations.Param;

/**
 * {@code TicketMapper} 工单数据访问层
 *  处理工单相关的数据库操作
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface TicketMapper {
    /**
     * 统计各状态工单数量
     * @param userId 用户ID
     * @return 状态-数量映射
     */
    Map<TicketStatus, Integer> countByStatus(@Param("userId") Long userId);

    /**
     * 统计用户相关工单数量
     */
    int countUserTickets(@Param("userId") Long userId);

    /**
     * 计算平均处理时间(小时)
     */
    Double calculateAvgProcessTime(@Param("userId") Long userId);

    /**
     * 计算平均满意度
     */
    Double calculateAvgSatisfaction(@Param("userId") Long userId);

    /**
     * 获取月度统计数据
     */
    List<MonthlyStatisticsVO> getMonthlyStatistics(@Param("userId") Long userId);

    /**
     * 获取部门统计数据
     */
    List<DepartmentStatisticsVO> getDepartmentStatistics();

    /**
     * 获取用户效率排名
     */
    List<Map<String, Object>> getEfficiencyRanking();

    /**
     * 获取部门工作量统计
     */
    List<Map<String, Object>> getDepartmentWorkload();

    /**
     * 获取待处理工单列表
     */
    List<Ticket> selectTodoList(@Param("processorId") Long processorId);

    /**
     * 按条件统计工单数量
     */
    int countTickets(@Param("query") TicketQueryDTO query);

    /**
     * 更新工单处理人
     */
    int updateProcessor(@Param("ticketId") Long ticketId,
                        @Param("processorId") Long processorId,
                        @Param("updateBy") Long updateBy);

    /**
     * 更新工单状态
     */
    int updateStatus(@Param("ticketId") Long ticketId,
                     @Param("status") TicketStatus status,
                     @Param("updateBy") Long updateBy);

    /**
     * 批量更新工单状态
     */
    int batchUpdateStatus(@Param("ticketIds") List<Long> ticketIds,
                          @Param("status") TicketStatus status,
                          @Param("updateBy") Long updateBy);

    /**
     * 获取个人工单统计
     */
    Map<String, Object> selectPersonalStatistics(@Param("userId") Long userId);

    /**
     * 获取部门工单明细
     */
    List<Ticket> selectDeptTickets(@Param("deptId") Long deptId,
                                   @Param("query") TicketQueryDTO query);

    /**
     * 导出工单数据
     */
    List<TicketExportDTO> selectForExport(@Param("query") TicketQueryDTO query);


    /**
     * 获取工单处理历史记录
     */
    List<TicketRecord> selectTicketHistory(@Param("ticketId") Long ticketId);


    /**
     * 基础CRUD操作
     */
    Ticket selectTicketById(@NotNull(message = "工单ID不能为空") Long ticketId);
    int insertTicket(Ticket ticket);
    int updateTicket(Ticket ticket);

    /**
     * 获取工单列表
     * @param queryDTO 查询条件
     * @return 工单详情
     */
    List<Ticket> selectTicketList(@Param("query") TicketQueryDTO queryDTO);

    /**
     * 获取工单详情
     * @param ticketId 工单ID
     * @return 工单详情
     */
    TicketDetailVO selectTicketDetail(Long ticketId);


    /**
     * 获取用户今日已完成工单数量
     * @param userId 用户ID
     * @param todayStart 今日开始时间
     * @return 今日已完成工单数量
     */
    Integer countTodayCompleted(@Param("userId") Long userId, @Param("todayStart") LocalDateTime todayStart);


    /**
     * 获取用户今日待办工单数量
     * @param userId 用户ID
     * @param ticketStatus 工单状态
     * @return 今日待办工单数量
     */
    Integer countTicketsByStatus(@Param("userId") Long userId, @Param("status") TicketStatus ticketStatus);

    /**
     * 获取用户今日已完成工单数量
     * @param userId     用户ID
     * @param todayStart     今日开始时间
     * @param todayEnd     今日结束时间
     * @return 今日已完成工单数量
     */
    Integer countCompletedTickets(@Param("userId") Long userId, @Param("startTime") LocalDateTime todayStart, @Param("endTime") LocalDateTime todayEnd);


    Integer countActiveTickets(Long userId);
}