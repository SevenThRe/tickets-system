package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.dto.ticket.CloseTicketRequest;
import com.icss.etc.ticket.entity.dto.ticket.ProcessTicketRequest;
import com.icss.etc.ticket.entity.dto.ticket.TransferTicketRequest;
import com.icss.etc.ticket.entity.dto.ticket.TicketExportDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketQueryDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketTrendDTO;
import com.icss.etc.ticket.entity.vo.TicketVO;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.service.TicketService;
import com.icss.etc.ticket.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tickets")
@Slf4j
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }
    /**
     * 创建工单
     */
    @PostMapping("/create")
    public R<Void> create(@RequestBody @Valid Ticket ticket) {
        ticket.setCreateBy(SecurityUtils.getCurrentUserId());
        ticket.setCreateTime(LocalDateTime.now());
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setIsDeleted(0);
        return ticketService.insert(ticket) > 0 ? R.OK() : R.FAIL();
    }

    /**
     * 获取工单列表
     */
    @GetMapping("/list")
    public R<Map<String, Object>> list(TicketQueryDTO queryDTO) {
        PageHelper.startPage(queryDTO.getPageNum(), queryDTO.getPageSize());
        PageInfo<TicketVO> pageInfo = new PageInfo<>(ticketService.pageList(queryDTO));
        Map<String, Object> result = new HashMap<>(2);
        result.put("total", pageInfo.getTotal());
        result.put("list", pageInfo.getList());
        return R.OK(result);
    }

    /**
     * 获取工单详情
     */
    @GetMapping("/{id}")
    public R<Ticket> detail(@PathVariable Long id) {
        return R.OK(ticketService.getById(id));
    }

    /**
     * 获取我的待办工单
     */
    @GetMapping("/todos")
    public R<List<Ticket>> getTodos(TicketQueryDTO queryDTO) {
        Long userId = SecurityUtils.getCurrentUserId();
        return R.OK(ticketService.getTodoTickets(userId, queryDTO));
    }

    /**
     * 获取我创建的工单
     */
    @GetMapping("/my")
    public R<List<Ticket>> getMyTickets(TicketQueryDTO queryDTO) {
        Long userId = SecurityUtils.getCurrentUserId();
        return R.OK(ticketService.getMyTickets(userId, queryDTO));
    }

    /**
     * 处理工单
     */
    @PutMapping("/{id}/process")
    public R<Void> processTicket(@PathVariable Long id, @RequestBody @Valid ProcessTicketRequest request) {
        try {
            int result = ticketService.processTicket(id, request.getNote());
            return result > 0 ? R.OK() : R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (IllegalArgumentException e) {
            log.error("工单处理失败", e);
            return R.FAIL(TicketEnum.TICKET_NOT_EXIST);
        } catch (IllegalStateException e) {
            log.error("工单处理失败", e);
            return R.FAIL(TicketEnum.TICKET_STATUS_EXCEPTION);
        }
    }

    /**
     * 完成工单
     */
    @PutMapping("/{id}/resolve")
    public R<Void> resolveTicket(@PathVariable Long id, @RequestBody @Valid TicketQueryDTO.ResolveTicketRequest request) {
        try {
            int result = ticketService.resolveTicket(id, request.getNote());
            return result > 0 ? R.OK() : R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (IllegalArgumentException e) {
            log.error("工单完成失败", e);
            return R.FAIL(TicketEnum.TICKET_NOT_EXIST);
        } catch (IllegalStateException e) {
            log.error("工单完成失败", e);
            return R.FAIL(TicketEnum.TICKET_STATUS_EXCEPTION);
        }
    }

    /**
     * 转交工单
     */
    @PostMapping("/{id}/transfer")
    public R<Void> transferTicket(@PathVariable Long id, @RequestBody @Valid TransferTicketRequest request) {
        request.setUpdateBy(SecurityUtils.getCurrentUserId());
        return ticketService.transferDept(id, request.getDepartmentId(), request.getUpdateBy()) > 0 ?
                R.OK() : R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
    }

    /**
     * 关闭工单
     */
    @PutMapping("/{id}/close")
    public R<Void> closeTicket(@PathVariable Long id, @RequestBody @Valid CloseTicketRequest request) {
        try {
            int result = ticketService.closeTicket(id, request.getNote());
            return result > 0 ? R.OK() : R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (IllegalArgumentException e) {
            log.error("工单关闭失败", e);
            return R.FAIL(TicketEnum.TICKET_NOT_EXIST);
        } catch (IllegalStateException e) {
            log.error("工单关闭失败", e);
            return R.FAIL(TicketEnum.TICKET_STATUS_EXCEPTION);
        }
    }

    /**
     * 导出工单列表
     */
    @GetMapping("/export")
    public R<List<TicketExportDTO>> exportTickets(TicketQueryDTO queryDTO) {
        return R.OK(ticketService.selectForExport(queryDTO));
    }

    /**
     * 分配处理人
     */
    @PutMapping("/{id}/processor")
    public R<Void> assignProcessor(@PathVariable Long id, @RequestParam Long processorId) {
        return ticketService.assignProcessor(id, processorId) > 0 ? R.OK() :
                R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
    }

    /**
     * 获取工单统计
     */
    @GetMapping("/statistics")
    public R<Map<String, Object>> getStatistics(@RequestParam Long deptId) {
        Map<String, Object> result = new HashMap<>(4);
        result.put("deptStats", ticketService.getDeptStats(deptId));
        result.put("typeStats", ticketService.getTypesStats(deptId));
        result.put("workloadStats", ticketService.getWorkloadStats(deptId));
        result.put("efficiencyStats", ticketService.getEfficiencyStats(deptId));
        return R.OK(result);
    }

    /**
     * 获取工单趋势
     */
    @GetMapping("/stats/trend")
    public R<List<TicketTrendDTO>> getTrendStats(
            @RequestParam Long deptId,
            @RequestParam(defaultValue = "7") Integer days
    ) {
        return R.OK(ticketService.getTrendStats(deptId, days));
    }


}