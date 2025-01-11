package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.ticket.TicketStatisticsVO;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/tickets")
@Slf4j
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /* My-Ticket.HTML 相关代码 */
    /**
     * 获取工单列表
     */
    @GetMapping("/list")
    public R<PageInfo<Ticket>> getTicketList(TicketQueryDTO queryDTO) {
        try {
            PageInfo<Ticket> pageInfo = ticketService.getTicketList(queryDTO);
            return R.OK(pageInfo);
        } catch (Exception e) {
            log.error("查询工单列表失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 获取工单详情
     */
    @GetMapping("/{ticketId}")
    public R<TicketDetailVO> getTicketDetail(@PathVariable Long ticketId) {
        try {
            TicketDetailVO detail = ticketService.getTicketDetail(ticketId);
            return R.OK(detail);
        } catch (BusinessException e) {
            log.error("查询工单详情失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_NOT_EXIST);
        } catch (Exception e) {
            log.error("查询工单详情失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 创建工单
     */
    @PostMapping
    public R<Long> createTicket(@RequestBody @Valid CreateTicketDTO createDTO) {
        try {
            Long ticketId = ticketService.createTicket(createDTO);
            return R.OK(ticketId);
        } catch (BusinessException e) {
            log.error("创建工单失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("创建工单失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 更新工单状态
     */
    @PutMapping("/status")
    public R<Void> updateTicketStatus(@RequestBody @Valid UpdateTicketStatusDTO updateDTO) {
        try {
            ticketService.updateTicketStatus(updateDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("更新工单状态失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("更新工单状态失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 添加处理记录
     */
    @PostMapping("/records")
    public R<Void> addTicketRecord(@RequestBody @Valid AddTicketRecordDTO recordDTO) {
        try {
            ticketService.addTicketRecord(recordDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("添加处理记录失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("添加处理记录失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 工单转交
     */
    @PostMapping("/{ticketId}/transfer")
    public R<Void> transferTicket(@RequestBody @Valid TransferTicketRequest request) {
        try {
            ticketService.transferTicket(request);
            return R.OK();
        } catch (BusinessException e) {
            log.error("工单转交失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("工单转交失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 工单评价
     */
    @PostMapping("/{ticketId}/evaluate")
    public R<Void> evaluateTicket(@RequestBody @Valid TicketEvaluationDTO evaluationDTO) {
        try {
            ticketService.evaluateTicket(evaluationDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("工单评价失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("工单评价失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 获取我的待办工单
     */
    @GetMapping("/todos")
    public R<PageInfo<Ticket>> getTodoTickets(TicketQueryDTO queryDTO) {
        try {
            PageInfo<Ticket> pageInfo = ticketService.getTodoTickets(queryDTO);
            return R.OK(pageInfo);
        } catch (Exception e) {
            log.error("查询待办工单失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    public R<TicketStatisticsVO> getStatistics(@RequestParam Long userId) {
        try {
            TicketStatisticsVO statistics = ticketService.getTicketStatistics(userId);
            return R.OK(statistics);
        } catch (Exception e) {
            log.error("获取统计数据失败:", e);
            return R.FAIL();
        }
    }
}