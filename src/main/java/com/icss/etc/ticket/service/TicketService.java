package com.icss.etc.ticket.service;

import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.TicketVO;
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

}