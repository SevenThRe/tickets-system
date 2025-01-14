package com.icss.etc.ticket.service;

import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.TicketType;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.TicketVO;
import com.icss.etc.ticket.entity.vo.TodoStatsVO;
import com.icss.etc.ticket.entity.vo.ticket.TicketStatisticsVO;
import com.icss.etc.ticket.enums.OperationType;
import com.icss.etc.ticket.enums.TicketStatus;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
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
     * 分配工单处理人
     * @param ticketId 工单ID
     * @param processorId 处理人ID
     */
    void assignProcessor(Long ticketId, Long processorId);

    /**
     * 自动分配工单处理人
     * @param ticketId 工单ID
     * @param departmentId 部门ID
     * @return 是否成功分配
     */
    boolean autoAssignProcessor(Long ticketId, Long departmentId);


    /**
     * 获取工单类型名称
     * @param typeId 类型ID
     * @return 类型名称
     */
    Map<String, Integer> countByStatus(Long userId);
}