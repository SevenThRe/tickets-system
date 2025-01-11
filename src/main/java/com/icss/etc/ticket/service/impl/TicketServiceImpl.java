package com.icss.etc.ticket.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.TicketVO;
import com.icss.etc.ticket.entity.vo.ticket.DepartmentStatisticsVO;
import com.icss.etc.ticket.entity.vo.ticket.MonthlyStatisticsVO;
import com.icss.etc.ticket.entity.vo.ticket.TicketStatisticsVO;
import com.icss.etc.ticket.enums.OperationType;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.DepartmentMapper;
import com.icss.etc.ticket.mapper.TicketMapper;
import com.icss.etc.ticket.mapper.TicketRecordMapper;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.service.NotificationService;
import com.icss.etc.ticket.service.TicketService;
import com.icss.etc.ticket.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * @ClassName
 * @Author SevenThRe
 * @Description
 * @Date 周六 22:35
 * @Version 1.0
 */
@Service
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketMapper ticketMapper;
    private final TicketRecordMapper ticketRecordMapper;
    private final NotificationService notificationService;

    public TicketServiceImpl(TicketMapper ticketMapper,
                             TicketRecordMapper ticketRecordMapper,
                             NotificationService notificationService) {
        this.ticketMapper = ticketMapper;
        this.ticketRecordMapper = ticketRecordMapper;
        this.notificationService = notificationService;
    }



    @Override
    public PageInfo<Ticket> getTicketList(TicketQueryDTO queryDTO) {
        if(queryDTO.getPageNum() == null || queryDTO.getPageNum() < 1) {
            queryDTO.setPageNum(1);
        }
        if(queryDTO.getPageSize() == null || queryDTO.getPageSize() < 1) {
            queryDTO.setPageSize(10);
        }
        PageHelper.startPage(queryDTO.getPageNum(), queryDTO.getPageSize());
        List<Ticket> list = ticketMapper.selectTicketList(queryDTO);
        return new PageInfo<>(list);
    }

    @Override
    public TicketDetailVO getTicketDetail(Long ticketId) {
        // 1. 获取工单详情
        TicketDetailVO detail = ticketMapper.selectTicketDetail(ticketId);
        if (detail == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        // 2. 获取处理记录
        List<TicketRecord> records = ticketRecordMapper.selectRecordsByTicketId(ticketId);
        detail.setRecords(records);

        return detail;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createTicket(CreateTicketDTO createDTO) {
        // 1. 数据校验
        if(createDTO.getDepartmentId() == null || createDTO.getTypeId() == null) {
            throw new BusinessException(TicketEnum.TICKET_INFO_ILLEGAL);
        }

        // 2. 创建工单
        Ticket ticket = new Ticket();
        BeanUtils.copyProperties(createDTO, ticket);
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setCreateTime(LocalDateTime.now());
        ticket.setCreateBy(createDTO.getCurrentUserId());
        ticket.setIsDeleted(0);

        if (ticketMapper.insertTicket(ticket) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        // 3. 添加创建记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(ticket.getTicketId());
        record.setOperatorId(createDTO.getCurrentUserId());
        record.setOperationType(OperationType.CREATE);
        record.setOperationContent("创建工单");
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        if(ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        if(ticket.getProcessorId() != null) {
            notificationService.createAssignNotification(
                    ticket.getTicketId(),
                    ticket.getProcessorId(),
                    String.format("您有新的工单待处理: %s", ticket.getTitle())
            );
        }

        return ticket.getTicketId();
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTicketStatus(UpdateTicketStatusDTO updateDTO) {
        // 1. 查询工单
        Ticket ticket = ticketMapper.selectTicketById(updateDTO.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        // 2. 校验状态流转
        validateStatusTransition(ticket.getStatus(), updateDTO.getStatus());

        // 3. 更新状态
        Ticket update = new Ticket();
        update.setTicketId(updateDTO.getTicketId());
        update.setStatus(updateDTO.getStatus());
        update.setUpdateBy(updateDTO.getOperatorId());
        update.setUpdateTime(LocalDateTime.now());

        // 如果是完成状态,设置实际完成时间
        if(updateDTO.getStatus() == TicketStatus.COMPLETED) {
            update.setActualFinishTime(LocalDateTime.now());
        }

        if (ticketMapper.updateTicket(update) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        // 4. 添加状态变更记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(updateDTO.getTicketId());
        record.setOperatorId(updateDTO.getOperatorId());
        record.setOperationType(convertStatusToOperation(updateDTO.getStatus()));
        record.setOperationContent(updateDTO.getContent());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        if(ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        switch(updateDTO.getStatus()) {
            case PROCESSING -> {
                notificationService.createAssignNotification(
                        updateDTO.getTicketId(),
                        ticket.getCreateBy(),
                        "您的工单已开始处理"
                );
            }
            case COMPLETED -> {
                notificationService.createCompleteNotification(
                        updateDTO.getTicketId(),
                        ticket.getCreateBy(),
                        "您的工单已处理完成,请确认"
                );
            }
            case CLOSED -> {
                notificationService.createCompleteNotification(
                        updateDTO.getTicketId(),
                        ticket.getProcessorId(),
                        "工单已关闭"
                );
            }
        }
    }

    @Override
    public void addTicketRecord(AddTicketRecordDTO recordDTO) {
        // 1. 检查工单是否存在
        Ticket ticket = ticketMapper.selectTicketById(recordDTO.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        // 2. 添加处理记录
        TicketRecord record = new TicketRecord();
        BeanUtils.copyProperties(recordDTO, record);
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        if (ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }
    }

    /**
     * 校验工单状态流转是否合法
     */
    private void validateStatusTransition(TicketStatus oldStatus, TicketStatus newStatus) {
        // 已关闭的工单不能再更改状态
        if(oldStatus == TicketStatus.CLOSED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "已关闭工单不能修改状态");
        }

        // 已完成的工单只能关闭
        if(oldStatus == TicketStatus.COMPLETED && newStatus != TicketStatus.CLOSED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "已完成工单只能关闭");
        }

        //TODO: 其他状态校验规则...
    }

    /**
     * 状态变更转换为操作类型
     */
    private OperationType convertStatusToOperation(TicketStatus status) {
        switch(status) {
            case PROCESSING:
                return OperationType.HANDLE;
            case COMPLETED:
                return OperationType.FINISH;
            case CLOSED:
                return OperationType.CLOSE;
            default:
                return OperationType.CREATE;
        }
    }

    /**
     * 工单转交
     * @param request 转交请求
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void transferTicket(TransferTicketRequest request) {
        // 1. 查询工单
        Ticket ticket = ticketMapper.selectTicketById(request.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        // 2. 校验状态
        if (ticket.getStatus() == TicketStatus.COMPLETED ||
                ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION);
        }

        // 3. 更新工单部门
        Ticket update = new Ticket();
        update.setTicketId(request.getTicketId());
        update.setDepartmentId(request.getDepartmentId());
        update.setProcessorId(null); // 清空处理人
        update.setUpdateBy(request.getUpdateBy());
        update.setUpdateTime(LocalDateTime.now());

        if (ticketMapper.updateTicket(update) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        // 4. 添加转交记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(request.getTicketId());
        record.setOperatorId(request.getUpdateBy());
        record.setOperationType(OperationType.TRANSFER);
        record.setOperationContent(request.getNote());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        ticketRecordMapper.insertRecord(record);

        // 通知新处理人
        notificationService.createAssignNotification(
                request.getTicketId(),
                request.getUpdateBy(),
                String.format("工单已转交给您处理: %s", ticket.getTitle())
        );

        // 通知原处理人
        if(ticket.getProcessorId() != null) {
            notificationService.createAssignNotification(
                    request.getTicketId(),
                    ticket.getProcessorId(),
                    String.format("工单已转交他人处理: %s", ticket.getTitle())
            );
        }
    }

    /**
     * 新增工单删除方法
     * @param ticketId 工单ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteTicket(Long ticketId) {
        // 逻辑删除工单
        Ticket ticket = ticketMapper.selectTicketById(ticketId);
        if(ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        ticket.setIsDeleted(1);
        ticket.setUpdateTime(LocalDateTime.now());
        ticketMapper.updateTicket(ticket);

        // 删除相关通知
        notificationService.deleteByTicketId(ticketId);

        // 记录删除操作
        TicketRecord record = new TicketRecord();
        record.setTicketId(ticketId);
        record.setOperatorId(SecurityUtils.getCurrentUserId());
        record.setOperationType(OperationType.CLOSE);
        record.setOperationContent("工单已删除");
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        ticketRecordMapper.insertRecord(record);
    }



    @Override
    @Transactional(rollbackFor = Exception.class)
    public void evaluateTicket(TicketEvaluationDTO evaluationDTO) {
        // 1. 查询工单
        Ticket ticket = ticketMapper.selectTicketById(evaluationDTO.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        // 2. 校验状态
        if (ticket.getStatus() != TicketStatus.COMPLETED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "只能评价已完成的工单");
        }

        // 3. 添加评价记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(evaluationDTO.getTicketId());
        record.setOperatorId(evaluationDTO.getEvaluatorId());
        record.setOperationType(OperationType.FINISH);
        record.setOperationContent(evaluationDTO.getContent());
        record.setEvaluationScore(evaluationDTO.getScore());
        record.setEvaluationContent(evaluationDTO.getContent());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        if(ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        // 4. 更新工单状态为已关闭
        this.updateTicketStatus(new UpdateTicketStatusDTO(
                evaluationDTO.getTicketId(),
                TicketStatus.CLOSED,
                evaluationDTO.getEvaluatorId(),
                "评价完成自动关闭"
        ));

        notificationService.createCompleteNotification(
                evaluationDTO.getTicketId(),
                ticket.getProcessorId(),
                String.format("工单已评价完成,评分: %d分", evaluationDTO.getScore())
        );
    }



    @Override
    public PageInfo<Ticket> getTodoTickets(TicketQueryDTO queryDTO) {
        // 设置状态为未完成
        queryDTO.setStatus(TicketStatus.PROCESSING);
        return this.getTicketList(queryDTO);
    }

    @Override
    public TicketStatisticsVO getTicketStatistics(Long userId) {
        TicketStatisticsVO statistics = new TicketStatisticsVO();

        // 1. 基础统计数据
        statistics.setTotalCount(ticketMapper.countUserTickets(userId));
        statistics.setStatusCount(ticketMapper.countByStatus(userId));
        statistics.setAvgProcessTime(ticketMapper.calculateAvgProcessTime(userId));
        statistics.setAvgSatisfaction(ticketMapper.calculateAvgSatisfaction(userId));

        // 2. 月度统计数据
        List<MonthlyStatisticsVO> monthlyStats = ticketMapper.getMonthlyStatistics(userId);
        statistics.setMonthlyStats(monthlyStats);

        // 3. 部门统计数据
        List<DepartmentStatisticsVO> deptStats = ticketMapper.getDepartmentStatistics();
        statistics.setDeptStats(deptStats);

        return statistics;
    }

    @Override
    public Map<String, Object> getEfficiencyAnalysis() {
        Map<String, Object> result = new HashMap<>();

        // 1. 处理效率排名
        result.put("efficiencyRanking", ticketMapper.getEfficiencyRanking());

        // 2. 部门工作量
        result.put("departmentWorkload", ticketMapper.getDepartmentWorkload());

        return result;
    }


    @Override
    public List<TicketExportDTO> exportTickets(TicketQueryDTO queryDTO) {
        // 调用Mapper查询数据
        return ticketMapper.selectForExport(queryDTO);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void importTickets(List<TicketExportDTO> exportDTOs) {
        for (TicketExportDTO exportDTO : exportDTOs) {
            // 1. 转换为Ticket实体
            Ticket ticket = new Ticket();
            BeanUtils.copyProperties(exportDTO, ticket);

            // 2. 设置默认值
            ticket.setStatus(TicketStatus.PENDING);
            ticket.setCreateBy(SecurityUtils.getCurrentUserId());
            ticket.setCreateTime(LocalDateTime.now());
            ticket.setIsDeleted(0);

            // 3. 保存数据
            ticketMapper.insertTicket(ticket);

            // 4. 添加创建记录
            TicketRecord record = new TicketRecord();
            record.setTicketId(ticket.getTicketId());
            record.setOperatorId(SecurityUtils.getCurrentUserId());
            record.setOperationType(OperationType.CREATE);
            record.setOperationContent("批量导入创建");
            record.setCreateTime(LocalDateTime.now());
            record.setIsDeleted(0);

            ticketRecordMapper.insertRecord(record);
        }
    }


}