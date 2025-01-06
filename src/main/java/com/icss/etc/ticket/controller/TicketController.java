package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Ticket;
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

@RequestMapping("ticket")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }



    @RequestMapping("selectAll")
    public List<Ticket> selectAll() {
        return ticketService.selectAll();
    }

    /**
     * 增加工单
     * @param ticket 工单对象
     * @return
     */
    @RequestMapping("add")
    public int add(Ticket ticket) {
        return ticketService.insertTicket(ticket);
    }

    /**
     * 获取代办工单
     * GET /ticket/todos
     * @return 代办工单列表
     */
    @RequestMapping("todos")
    public R<List<Ticket>> getTodos() {
        return R.OK(ticketService.getTodos());
    }

}
