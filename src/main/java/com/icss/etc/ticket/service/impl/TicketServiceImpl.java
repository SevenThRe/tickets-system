package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.mapper.TicketMapper;
import com.icss.etc.ticket.service.TicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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


    @Override
    public int insert(Ticket ticket) {
        if (ticketMapper.getById(ticket.getTicketId()) != null) {
            log.error(TicketEnum.TICKET_EXIST.getMessage());
            return TicketEnum.TICKET_EXIST.getCode();
        }
        // TODO: 校验参数合法性


        log.info("insert ticket: {}", ticket);
        return ticketMapper.insert(ticket);
    }

    @Override
    public int update(Ticket ticket) {
        if (ticketMapper.getById(ticket.getTicketId()) == null) {
            log.error(TicketEnum.TICKET_NOT_EXIST.getMessage());
            return TicketEnum.TICKET_NOT_EXIST.getCode();
        }
        // TODO: 校验参数合法性

        log.info("update ticket: {}", ticket);
        return ticketMapper.update(ticket);
    }

    @Override
    public int deleteById(Long ticketId) {
        if (ticketMapper.getById(ticketId) == null) {
            log.error(TicketEnum.TICKET_NOT_EXIST.getMessage());
            return TicketEnum.TICKET_NOT_EXIST.getCode();
        }
        // TODO: 校验参数合法性

        log.info("delete ticket: {}", ticketId);
        return ticketMapper.deleteById(ticketId);
    }

    @Override
    public Ticket getById(Long ticketId) {
        log.info("get ticket by id: {}", ticketId);
        return ticketMapper.getById(ticketId);
    }

    @Override
    public List<Ticket> pageList(TicketQueryDTO queryDTO) {
        log.info("page list for : {}", queryDTO);
        return ticketMapper.pageList(queryDTO);
    }

    @Override
    public long count(TicketQueryDTO queryDTO) {
        log.info("count for : {}", queryDTO);
        return ticketMapper.count(queryDTO);
    }

    @Override
    public List<Ticket> getMyTickets(Long userId, TicketQueryDTO queryDTO) {
        log.info("get user: {} tickets for query: {}", userId, queryDTO);
        return ticketMapper.getMyTickets(userId, queryDTO);
    }

    @Override
    public List<Ticket> getTodoTickets(Long userId, TicketQueryDTO queryDTO) {
        log.info("get user: {} todo tickets for query: {}", userId, queryDTO);
        return ticketMapper.getTodoTickets(userId, queryDTO);
    }

    @Override
    public List<Ticket> getDeptTickets(Long deptId, TicketQueryDTO queryDTO) {
        log.info("get dept: {} tickets for query: {}", deptId, queryDTO);
        return ticketMapper.getDeptTickets(deptId, queryDTO);
    }

    @Override
    public int updateStatus(Long ticketId, Integer status, Long updateBy) {
        // TODO: 校验状态是否合法
        // TODO: 校验处理人是否存在
        log.info("update status for ticket: {}, status: {}, updateBy: {}", ticketId, status, updateBy);
        return 0;
    }

    @Override
    public int assignProcessor(Long ticketId, Long processorId) {
        if (ticketMapper.getById(ticketId) == null) {
            log.error(TicketEnum.TICKET_NOT_EXIST.getMessage());
            return TicketEnum.TICKET_NOT_EXIST.getCode();
        }
        // TODO: 校验处理人是否存在
        log.info("assign processor for ticket: {}, processor: {}", ticketId, processorId);
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
        log.info("get dept stats for dept: {}", deptId);
        return ticketMapper.getDeptStats(deptId);
    }

    @Override
    public ProcessorStatsDTO getProcessorStats(Long processorId) {
        log.info("get processor stats for processor: {}", processorId);
        return ticketMapper.getProcessorStats(processorId);
    }

    @Override
    public List<TicketTypeStatsDTO> getTypesStats(Long deptId) {
        log.info("get types stats for dept: {}", deptId);
        return ticketMapper.getTypesStats(deptId);
    }

    @Override
    public List<TicketTrendDTO> getTrendStats(Long deptId, Integer days) {
        log.info("get trend stats for dept: {}, days: {}", deptId, days);
        return ticketMapper.getTrendStats(deptId, days);
    }

    @Override
    public List<WorkloadStatsDTO> getWorkloadStats(Long deptId) {
        log.info("get workload stats for dept: {}", deptId);
        return ticketMapper.getWorkloadStats(deptId);
    }

    @Override
    public List<EfficiencyStatsDTO> getEfficiencyStats(Long deptId) {
        log.info("get efficiency stats for dept: {}", deptId);
        return ticketMapper.getEfficiencyStats(deptId);
    }

    @Override
    public List<TicketExportDTO> selectForExport(TicketQueryDTO queryDTO) {
        log.info("select for export: {}", queryDTO);
        return ticketMapper.selectForExport(queryDTO);
    }
}
