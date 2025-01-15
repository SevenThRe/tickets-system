package com.icss.etc.ticket.service;

import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.TicketType;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.TodoStatsVO;
import com.icss.etc.ticket.entity.vo.ticket.TicketStatisticsVO;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

/**
 * @ClassName TicketService
 * @Author SevenThRe
 * @Description TicketService 工单服务类
 * @Date 周六 21:44
 * @Version 1.0
 */

public interface TicketService {

    /**
     * 获取工单列表
     */
    PageInfo<Ticket> getTicketList(TicketQueryDTO queryDTO);

    /**
     * 获取工单详情
     */
    TicketDetailVO getTicketDetail(Long ticketId);

    /**
     * 创建工单
     */
    Long createTicket(CreateTicketDTO createDTO);

    /**
     * 删除工单
     */
    void deleteTicket(Long ticketId);

    /**
     * 更新工单状态
     */
    void updateTicketStatus(UpdateTicketStatusDTO updateDTO);

    /**
     * 添加处理记录
     */
    void addTicketRecord(AddTicketRecordDTO recordDTO);

    /**
     * 工单转交
     */
    void transferTicket(TransferTicketRequest request);

    /**
     * 工单评价
     */
    void evaluateTicket(TicketEvaluationDTO evaluationDTO);

    /**
     * 获取待办工单
     */
    PageInfo<Ticket> getTodoTickets(TicketQueryDTO queryDTO);

    /**
     * 获取工单统计
     */
    TicketStatisticsVO getTicketStatistics(Long userId);

    /**
     * 获取效率分析
     */
    Map<String, Object> getEfficiencyAnalysis();

    /**
     * 导出工单数据
     */
    List<TicketExportDTO> exportTickets(TicketQueryDTO queryDTO);

    /**
     * 批量导入工单
     */
    void importTickets(List<TicketExportDTO> tickets);

    /**
     * 获取工单类型
     * @return 工单类型列表
     */
    List<TicketType> getTicketTypeList();


    /**
     * 获取待办工单统计
     * @param userId 用户ID
     * @return 统计信息
     */
    TodoStatsVO getTodoStats(Long userId);



    /**
     * 获取工单类型名称
     * @param typeId 类型ID
     * @return 类型名称
     */
    Map<String, Integer> countByStatus(Long userId);

    /**
     * 根据工单Id查询工单是否没有被评价过
     * 如果没有评价且是已完成状态则返回工单
     * @param ticketId 工单ID
     * @return 工单
     */
    Ticket getTicketById(@NotNull(message = "工单ID不能为空") Long ticketId);


    boolean canEvaluate(@NotNull(message = "工单ID不能为空") Long ticketId, @NotNull(message = "评价人不能为空") Long evaluatorId);

    /**
     * 自动分配待处理工单
     */
    void autoAssignPendingTickets();
}