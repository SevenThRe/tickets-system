package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketVO;
import com.icss.etc.ticket.enums.OperationType;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.mapper.DepartmentMapper;
import com.icss.etc.ticket.mapper.TicketMapper;
import com.icss.etc.ticket.mapper.TicketRecordMapper;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.service.TicketService;
import com.icss.etc.ticket.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @ClassName
 * @Author SevenThRe
 * @Description
 * @Date 周六 22:35
 * @Version 1.0
 */
@Service
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketMapper ticketMapper;
    private final TicketRecordMapper ticketRecordMapper;

    private final DepartmentMapper departmentMapper;

    private final UserMapper userMapper;
    /**
     *  校验工单是否合法
     * @param ticket 工单实体
     * @return true 合法 false 不合法
     */
    boolean verification(Ticket ticket) {
        // 校验预期时间是否合法
        if (ticket.getExpectFinishTime() == null || ticket.getExpectFinishTime().isBefore(LocalDateTime.now())) {
            ticket.setExpectFinishTime(ticket.getCreateTime().plusHours(2));
        }
        // TODO: 校验表单类型是否合法
        // TODO: 校验处理人是否存在
        // TODO: 校验部门是否存在
        return true;
    }

    /**
     * 校验工单是否存在
     * @param ticketId 工单ID
     * @param shouldExist 是否应该存在
     * @return 0 通过校验 -1 已存在 -2 不存在
     */
    private int checkTicketExistence(Long ticketId, boolean shouldExist) {
        Ticket ticket = ticketMapper.getById(ticketId);
        if (shouldExist && ticket == null) {
            if (log.isErrorEnabled()) {
                log.error(TicketEnum.TICKET_NOT_EXIST.getMessage());
            }
            return TicketEnum.TICKET_NOT_EXIST.getCode();
        } else if (!shouldExist && ticket != null) {
            if (log.isErrorEnabled()) {
                log.error(TicketEnum.TICKET_EXIST.getMessage());
            }
            return TicketEnum.TICKET_EXIST.getCode();
        }
        return 0;
    }


    public TicketServiceImpl(TicketMapper ticketMapper, TicketRecordMapper ticketRecordMapper, DepartmentMapper departmentMapper, UserMapper userMapper) {
        this.ticketMapper = ticketMapper;
        this.ticketRecordMapper = ticketRecordMapper;
        this.departmentMapper = departmentMapper;
        this.userMapper = userMapper;
    }

    @Override
    public int processTicket(Long ticketId, String note) {
        // 获取工单信息
        Ticket ticket = ticketMapper.getById(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("工单不存在");
        }

        // 校验工单状态
        if (ticket.getStatus() != TicketStatus.PENDING) {
            throw new IllegalStateException("工单状态异常，只有待处理的工单可以开始处理");
        }

        // 更新工单状态
        ticket.setStatus(TicketStatus.PROCESSING);
        ticket.setProcessorId(SecurityUtils.getCurrentUserId());
        ticket.setUpdateBy(SecurityUtils.getCurrentUserId());
        ticket.setUpdateTime(LocalDateTime.now());

        // 记录操作日志
        TicketRecord record = new TicketRecord();
        record.setTicketId(ticketId);
        record.setOperationType(OperationType.HANDLE);
        record.setOperationContent(note);
        record.setOperatorId(SecurityUtils.getCurrentUserId());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);
        ticketRecordMapper.insert(record);

        return ticketMapper.update(ticket);
    }

    @Override
    public int resolveTicket(Long ticketId, String note) {
        // 获取工单信息
        Ticket ticket = ticketMapper.getById(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("工单不存在");
        }

        // 校验工单状态
        if (ticket.getStatus() != TicketStatus.PROCESSING) {
            throw new IllegalStateException("工单状态异常，只有处理中的工单可以完成");
        }

        // 更新工单状态
        ticket.setStatus(TicketStatus.COMPLETED);
        ticket.setActualFinishTime(LocalDateTime.now());
        ticket.setUpdateBy(SecurityUtils.getCurrentUserId());
        ticket.setUpdateTime(LocalDateTime.now());

        // 记录操作日志
        TicketRecord record = new TicketRecord();
        record.setTicketId(ticketId);
        record.setOperationType(OperationType.FINISH);
        record.setOperationContent(note);
        record.setOperatorId(SecurityUtils.getCurrentUserId());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);
        ticketRecordMapper.insert(record);

        return ticketMapper.update(ticket);
    }

    @Override
    public int closeTicket(Long ticketId, String note) {
        // 获取工单信息
        Ticket ticket = ticketMapper.getById(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("工单不存在");
        }

        // 校验工单状态
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new IllegalStateException("工单已关闭");
        }

        // 更新工单状态
        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setUpdateBy(SecurityUtils.getCurrentUserId());
        ticket.setUpdateTime(LocalDateTime.now());

        // 记录操作日志
        TicketRecord record = new TicketRecord();
        record.setTicketId(ticketId);
        record.setOperationType(OperationType.CLOSE);
        record.setOperationContent(note);
        record.setOperatorId(SecurityUtils.getCurrentUserId());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);
        ticketRecordMapper.insert(record);

        return ticketMapper.update(ticket);
    }

    @Override
    public int addRecord(TicketRecord record) {
        return ticketRecordMapper.insert(record);
    }



    @Override
    public int insert(Ticket ticket) {
        int result = checkTicketExistence(ticket.getTicketId(), false);
        if (result != 0) {
            return result;
        }
        if (!verification(ticket)) {
            if (log.isErrorEnabled()) {
                log.error(TicketEnum.TICKET_INFO_ILLEGAL.getMessage());
            }
            return TicketEnum.TICKET_INFO_ILLEGAL.getCode();
        }
        return ticketMapper.insert(ticket);
    }

    @Override
    public int update(Ticket ticket) {
       int result = checkTicketExistence(ticket.getTicketId(), true);
        if (result != 0) {
            return result;
        }
        if (!verification(ticket)) {
            if (log.isErrorEnabled()) {
                log.error(TicketEnum.TICKET_INFO_ILLEGAL.getMessage());
            }
            return TicketEnum.TICKET_INFO_ILLEGAL.getCode();
        }
        return ticketMapper.update(ticket);
    }

    @Override
    public int deleteById(Long ticketId) {
        int result = checkTicketExistence(ticketId, true);
        if (result != 0) {
            return result;
        }
        if (ticketMapper.getById(ticketId).getIsDeleted() == 1) {
            if (log.isErrorEnabled()) {
                log.error(TicketEnum.TICKET_DELETED.getMessage());
            }
            return TicketEnum.TICKET_DELETED.getCode();
        }
        return ticketMapper.deleteById(ticketId);
    }

    @Override
    public Ticket getById(Long ticketId) {
        return ticketMapper.getById(ticketId);
    }

    @Override
    public List<TicketVO> pageList(TicketQueryDTO queryDTO) {
        List<Ticket> tickets = ticketMapper.pageList(queryDTO);
        //Ticket 转换 TicketVO
        // 其他属性的映射
        List<TicketVO> collect = tickets.stream()
                .map(ticket -> {
                    // 其他属性的映射
                    return TicketVO.builder()
                            .ticketId(ticket.getTicketId())
                            .title(ticket.getTitle())
                            .departmentName(Optional.ofNullable(departmentMapper.selectByPrimaryKey(ticket.getDepartmentId()))
                                    .map(Department::getDepartmentName)
                                    .orElse(null))
                            .processorName(Optional.ofNullable(userMapper.selectByPrimaryKey(ticket.getProcessorId()))
                                    .map(User::getRealName)
                                    .orElse(null))
                            .status(ticket.getStatus())
                            .priority(ticket.getPriority())
                            .createTime(ticket.getCreateTime())
                            .expectFinishTime(ticket.getExpectFinishTime())
                            .build();
                })
                .toList();

        return collect;


    }

    @Override
    public long count(TicketQueryDTO queryDTO) {
        return ticketMapper.count(queryDTO);
    }

    @Override
    public List<Ticket> getMyTickets(Long userId, TicketQueryDTO queryDTO) {
        return ticketMapper.getMyTickets(userId, queryDTO);
    }

    @Override
    public List<Ticket> getTodoTickets(Long userId, TicketQueryDTO queryDTO) {
        return ticketMapper.getTodoTickets(userId, queryDTO);
    }

    @Override
    public List<Ticket> getDeptTickets(Long deptId, TicketQueryDTO queryDTO) {
        return ticketMapper.getDeptTickets(deptId, queryDTO);
    }

    @Override
    public int updateStatus(Long ticketId, Integer status, Long updateBy) {
        // TODO: 校验状态是否合法
        // TODO: 校验处理人是否存在
        return 0;
    }

    @Override
    public int assignProcessor(Long ticketId, Long processorId) {
        if (ticketMapper.getById(ticketId) == null) {
            log.error(TicketEnum.TICKET_NOT_EXIST.getMessage());
            return TicketEnum.TICKET_NOT_EXIST.getCode();
        }
        // TODO: 校验处理人是否存在
        return ticketMapper.assignProcessor(ticketId, processorId);
    }

    @Override
    public int transferDept(Long ticketId, Long deptId, Long updateBy) {
        if (ticketMapper.getById(ticketId) == null) {
            log.error(TicketEnum.TICKET_NOT_EXIST.getMessage());
            return TicketEnum.TICKET_NOT_EXIST.getCode();
        }
        // TODO: 校验参数合法性

        return ticketMapper.transferDept(ticketId, deptId, updateBy);
    }

    @Override
    public DeptTicketStatsDTO getDeptStats(Long deptId) {
        return ticketMapper.getDeptStats(deptId);
    }

    @Override
    public ProcessorStatsDTO getProcessorStats(Long processorId) {
        return ticketMapper.getProcessorStats(processorId);
    }

    @Override
    public List<TicketTypeStatsDTO> getTypesStats(Long deptId) {
        return ticketMapper.getTypesStats(deptId);
    }

    @Override
    public List<TicketTrendDTO> getTrendStats(Long deptId, Integer days) {
        return ticketMapper.getTrendStats(deptId, days);
    }

    @Override
    public List<WorkloadStatsDTO> getWorkloadStats(Long deptId) {
        return ticketMapper.getWorkloadStats(deptId);
    }

    @Override
    public List<EfficiencyStatsDTO> getEfficiencyStats(Long deptId) {
        return ticketMapper.getEfficiencyStats(deptId);
    }

    @Override
    public List<TicketExportDTO> selectForExport(TicketQueryDTO queryDTO) {
        return ticketMapper.selectForExport(queryDTO);
    }


    public UserMapper getUserMapper() {
        return userMapper;
    }
}
