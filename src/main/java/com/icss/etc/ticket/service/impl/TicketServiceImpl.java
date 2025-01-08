package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.entity.dto.ticket.TicketExportDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketQueryDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketTrendDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketTypeStatsDTO;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.mapper.TicketMapper;
import com.icss.etc.ticket.service.TicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public TicketServiceImpl(TicketMapper ticketMapper) {
        this.ticketMapper = ticketMapper;
    }

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
    public List<Ticket> pageList(TicketQueryDTO queryDTO) {
        return ticketMapper.pageList(queryDTO);
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
}
