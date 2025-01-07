package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.dto.TicketQueryDTO;
import com.icss.etc.ticket.service.TicketService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * {@code TicketController} 类用于处理与 {@code Ticket} 相关的请求。
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
@RestController

@RequestMapping("tickets")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * 创建工单
     * @param ticket 工单信息
     * @return 影响行数
     */
    @RequestMapping("create")
    public R<Integer> create(Ticket ticket) {
        return ticketService.insert(ticket)>0 ? R.OK() : R.FAIL();
    }

    /**
     * 获取工单列表
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    @RequestMapping("list")
    public R<List<Ticket>> list(TicketQueryDTO queryDTO) {
        return R.OK(ticketService.pageList(queryDTO));
    }
}
