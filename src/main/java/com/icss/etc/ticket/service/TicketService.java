package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.dto.*;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @ClassName TicketService
 * @Author SevenThRe
 * @Description TicketService 工单服务类
 * @Date 周六 21:44
 * @Version 1.0
 */

public interface TicketService {
    /**
     * 创建工单
     * @param ticket 工单信息
     * @return 影响行数
     */
    int insert(Ticket ticket);

    /**
     * 更新工单
     * @param ticket 工单信息
     * @return 影响行数
     */
    int update(Ticket ticket);

    /**
     * 伪删除工单
     * @param ticketId 工单ID
     * @return 影响行数
     */
    int deleteById(Long ticketId);

    /**
     * 获取工单详情
     * @param ticketId 工单ID
     * @return 工单信息
     */
    Ticket getById(Long ticketId);

    /**
     * 分页查询工单列表
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    List<Ticket> pageList(@Param("queryDTO") TicketQueryDTO queryDTO);

    /**
     * 查询工单总数
     *
     * @param queryDTO 查询条件
     * @return 总数
     */
    long count(@Param("queryDTO") TicketQueryDTO queryDTO);

    /**
     * 查询我的工单
     * @param userId 用户ID
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    List<Ticket> getMyTickets(@Param("userId") Long userId, @Param("queryDTO") TicketQueryDTO queryDTO);

    /**
     * 查询待办工单
     * @param userId 用户ID
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    List<Ticket> getTodoTickets(@Param("userId") Long userId, @Param("queryDTO") TicketQueryDTO queryDTO);

    /**
     * 查询部门工单
     * @param deptId 部门ID
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    List<Ticket> getDeptTickets(@Param("deptId") Long deptId, @Param("queryDTO") TicketQueryDTO queryDTO);

    /**
     * 更新工单状态
     * @param ticketId 工单ID
     * @param status 状态
     * @param updateBy 更新人
     * @return 影响行数
     */
    int updateStatus(@Param("ticketId") Long ticketId, @Param("status") Integer status, @Param("updateBy") Long updateBy);

    /**
     * 分配处理人
     * @param ticketId 工单ID
     * @param processorId 处理人ID
     * @return 影响行数
     */
    int assignProcessor(@Param("ticketId") Long ticketId, @Param("processorId") Long processorId);

    /**
     * 转交部门
     * @param ticketId 工单ID
     * @param deptId 部门ID
     * @return 影响行数
     */
    int transferDept(@Param("ticketId") Long ticketId, @Param("deptId") Long deptId, @Param("updateBy") Long updateBy);

    /**
     * 部门工单统计
     * @param deptId 部门ID
     * @return 统计结果
     */
    DeptTicketStatsDTO getDeptStats(Long deptId);

    /**
     * 处理人工作量统计
     * @param processorId 处理人ID
     * @return 统计结果
     */
    ProcessorStatsDTO getProcessorStats(Long processorId);

    /**
     * 工单类型分布统计
     * @param deptId 部门ID
     * @return 统计列表
     */
    List<TicketTypeStatsDTO> getTypesStats(Long deptId);

    /**
     * 工单趋势统计
     * @param deptId 部门ID
     * @param days 天数
     * @return 统计列表
     */
    List<TicketTrendDTO> getTrendStats(@Param("deptId") Long deptId, @Param("days") Integer days);

    /**
     * 工作量统计
     * @param deptId 部门ID
     * @return 统计列表
     */
    List<WorkloadStatsDTO> getWorkloadStats(Long deptId);

    /**
     * 处理效率统计
     * @param deptId 部门ID
     * @return 统计列表
     */
    List<EfficiencyStatsDTO> getEfficiencyStats(Long deptId);

    /**
     * 导出工单列表
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    List<TicketExportDTO> selectForExport(TicketQueryDTO queryDTO);
}